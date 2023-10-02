// Topics page with infinite hits

const topicTitle = document.getElementById("topic-title").innerText;

// Algolia Search

const searchClient = algoliasearch(
    "7MTSAM17R6",
    "e53cb2eceea20be62c0ea021fe2f5d14"
);

const search = instantsearch({ indexName: "hubermandev_subtopics_asc", searchClient, routing: true });

// Search With Search bar and and categories facet filters

search.addWidgets([

    instantsearch.widgets.configure({
        filters: `topics.name:"${topicTitle}"`
    }),


    instantsearch.widgets.refinementList({
        container: "#category-list",
        attribute: "category.name",
        sortBy: ["count:desc", "name:asc"],
    }),

    instantsearch.widgets.infiniteHits({
        container: "#hits",
        templates: {
            item: `
          <div class="hit" episode-card algolia-category="{{category.name}}" algolia-subtopics='[{{#subtopics}}&#34;{{name}}&#34;, {{/subtopics}}]' algolia-sort-date="{{postDate}}">
              <a href="{{link}}" class="u-aspect-thumbnail" card-wrapper>
                  <img class="u-img-cover" src="{{thumbnail}}" alt="{{name}}" />
                  <div class="u-img-cover" card-overlay></div>
              </a>
              <a href="{{link}}" class="hit-content" card-wrapper>
                    <p class="hit-title" card-title>{{name}}</p>
                    {{#fromEpisode}}
                      <div class="paragraph-x-small u-text-black-60">From Episode</div>
                      <div class="paragraph-small u-text-black">{{fromEpisode}}</div>
                      <div class="paragraph-small u-text-black-60" algolia-date >{{postDate}}</div>
                    {{/fromEpisode}}
                    <div class="hit-category" card-opacity>{{category.name}}</div>
              </a>
          </div>
          `
        }
    }),

    instantsearch.widgets.hitsPerPage({
        container: "#hits-per-page",
        items: [{ label: "10 hits per page", value: 10, default: true }]
    }),

    // add sortby widget
    instantsearch.widgets.sortBy({
        container: "#sort-by",
        items: [
            { label: "Subtopics: A-Z", value: "hubermandev_subtopics_asc" },
            { label: "Subtopics: Z-A", value: "hubermandev_subtopics_desc" },
            { label: "Date: Newest first", value: "hubermandev_postDate_desc" },
            { label: "Date: Oldest first", value: "hubermandev_postDate_asc" },
        ]
    }),
]);

search.on("render", function () {
    onRender();
});

search.start();

function onRender() {
    // make postDate friendly
    document.querySelectorAll("[algolia-date]").forEach((date) => {
        const dateObj = new Date(date.innerText);
        date.innerText = dateObj.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            timeZone: 'UTC'
        });
    });


    // category tags on results
    const styles = {
        "Solo Episode": { backgroundColor: "#F0F9FF", color: "#0369A1" },
        "Guest Episode": { backgroundColor: "#E8F5E9", color: "#1B5E20" },
        "Guest Series": { backgroundColor: "#E0F2F1", color: "#004D40" },
        Topic: { backgroundColor: "#F2F2F2", color: "#666666" },
        Newsletter: { backgroundColor: "#E8EAF6", color: "#1A237E" },
        Timestamp: { backgroundColor: "#FFF3E0", color: "#E65100" },
        AMA: { backgroundColor: "#FEFCE8", color: "#854D0E" },
        Blueprint: {
            backgroundColor: "hsla(196, 100%, 47%, 0.08)",
            color: "#00AEEF"
        }
    };

    // add style to each tag
    document.querySelectorAll(".hit-category").forEach((tag) => {
        const style = styles[tag.innerText];
        if (style) {
            Object.assign(tag.style, style);
        }
    });

    // add focus states to facets
    document
        .querySelectorAll(".ais-RefinementList-checkbox")
        .forEach((checkbox) => {
            checkbox.addEventListener("focus", () =>
                checkbox.closest(".ais-RefinementList-item").classList.add("focused")
            );
            checkbox.addEventListener("blur", () =>
                checkbox.closest(".ais-RefinementList-item").classList.remove("focused")
            );
        });

    // const select with class .ais-SortBy-select
    const sortSelect = document.querySelector(".ais-SortBy-select");

    // get value of select
    const sortSelectValue = sortSelect.value;

    if (sortSelectValue === "hubermandev_subtopics_asc" || sortSelectValue === "hubermandev_subtopics_desc") {

        // get all children of subtopicsList with attribute subtopic-list
        const subtopicsItems = document.querySelectorAll("[subtopic-list]");

        let subtopicsArray = [];

        // loop through each subtopic item
        subtopicsItems.forEach((subtopic) => {
            let subtopicName = subtopic.innerText;
            // push subtopic name to array
            subtopicsArray.push(subtopicName);
        });

        // const hits with class .ais-InfiniteHits-item
        const hits = document.querySelectorAll(".ais-InfiniteHits-item");


        // create ol element
        let ol = document.createElement("ol");
        // add class subtopics-list to ol
        ol.classList.add("subtopics-list");

        function createSubtopic(subtopicName) {
            return `
            <li class="subtopic-item" subtopic-section="${subtopicName}">
                <p class="u-font-semibold-600 u-text-black-40">Subtopic</p>
                <h3 class="h6 u-mb-1">${subtopicName}</h3>
                <ol class="subtopic-episodes" episodes-wrapper="${subtopicName}"></ol>
                <div class="subtopic-timestamps-wrapper">
                <h4 class="h7 u-mb-1">${subtopicName} - Timestamps</h4>
                <ol class="subtopic-timestamps" timestamps-wrapper="${subtopicName}"></ol>
                </div>
            </li>
            `;
        }

        // loop through each subtopic in array
        subtopicsArray.forEach((subtopic) => {
            // create li element with subtopic name
            let li = createSubtopic(subtopic);
            // append li to ol
            ol.innerHTML += li;
        });

        // delete .ais-InfiniteHits-list
        document.querySelector(".ais-InfiniteHits-list").remove();

        // append ol to .ais-InfiniteHits
        document.querySelector(".ais-InfiniteHits").prepend(ol);

        let forEachCount = 0;

        // loop through each hit
        hits.forEach((hit) => {
            // get algolia-category attribute value from direct child of hit
            let category = hit.children[0].getAttribute("algolia-category");

            // get subtopics attribute value from direct child of hit
            let subtopics = hit.children[0].getAttribute("algolia-subtopics");
            // split subtopics string into array
            subtopics = subtopics.split('",');
            // remove last item in array
            subtopics.pop();
            // remove this character [ from first item in array
            subtopics[0] = subtopics[0].replace('[', '');
            // remove quotes from each item in array
            subtopics = subtopics.map((subtopic) => {
                return subtopic.replace(/"/g, '');
            });
            // if item starts with space remove space
            subtopics = subtopics.map((subtopic) => {
                if (subtopic.startsWith(' ')) {
                    return subtopic.replace(' ', '');
                } else {
                    return subtopic;
                }
            });
            // sort subtopics reverse alphabetically
            subtopics.sort().reverse();

            subtopics.forEach((subtopic) => {
                // if subtopic exists in subtopicsArray
                if (subtopicsArray.includes(subtopic)) {
                    // if category is Timestamp
                    if (category === "Timestamp") {
                        // get element with attribute timestamps-wrapper and value of subtopic
                        let timestampsWrapper = document.querySelector(`[timestamps-wrapper="${subtopic}"]`);
                        // append hit to timestampsWrapper
                        timestampsWrapper.appendChild(hit);
                    } else {
                        // get element with attribute episodes-wrapper and value of subtopic
                        let episodesWrapper = document.querySelector(`[episodes-wrapper="${subtopic}"]`);
                        // append hit to episodesWrapper
                        episodesWrapper.appendChild(hit);
                    }
                }
            });

            forEachCount++;
            if (forEachCount === hits.length) {
                deleteEmpties();
            }

        });

        function deleteEmpties() {
            // get all children of allHits with attribute subtopic-section
            const subtopicSections = document.querySelectorAll("[subtopic-section]");

            function deleteEmptySubtopicSections() {
                // loop through each subtopic section
                subtopicSections.forEach((subtopicSection) => {
                    if (subtopicSection.hasAttribute("no-episodes") && subtopicSection.hasAttribute("no-timestamps")) {
                        subtopicSection.remove();
                    }
                });
            }

            let subtopicSectionsCount = 0;
            // loop through each subtopic section
            subtopicSections.forEach((subtopicSection) => {
                const episodesWrapper = subtopicSection.querySelector("[episodes-wrapper]");
                if (subtopicSection.querySelector("[episodes-wrapper]")) {
                    if (episodesWrapper.innerHTML === "") {
                        // add attribute no-episodes to subtopicSection
                        subtopicSection.setAttribute("no-episodes", "");
                        episodesWrapper.remove();
                    }
                }
                const timestampsWrapper = subtopicSection.querySelector("[timestamps-wrapper]");
                if (subtopicSection.querySelector("[timestamps-wrapper]")) {
                    if (timestampsWrapper.innerHTML === "") {
                        // add attribute no-timestamps to subtopicSection
                        subtopicSection.setAttribute("no-timestamps", "");
                        // remove timestampsWrapper parent element
                        timestampsWrapper.parentElement.remove();
                    }
                }
                subtopicSectionsCount++;
                if (subtopicSectionsCount === subtopicSections.length) {
                    deleteEmptySubtopicSections();
                }
            });
        }

    } else {


        const monthNames = {
            "01": "January",
            "02": "February",
            "03": "March",
            "04": "April",
            "05": "May",
            "06": "June",
            "07": "July",
            "08": "August",
            "09": "September",
            10: "October",
            11: "November",
            12: "December"
        };

        function monthSection(month, year) {
            return `
          <li subtopic-section="${month} ${year}">
            <h2 class="h5 u-mb-1-5">${month} ${year}</h2>
            <ol class="subtopic-episodes" episodes-wrapper="${month} ${year}"></ol>
            <div class="subtopic-timestamps-wrapper">
            <h4 class="h7 u-mb-1">${month} ${year} - Timestamps</h4>
            <ol class="subtopic-timestamps" timestamps-wrapper="${month} ${year}"></ol>
            </div>
          </li>
          `;
        }

        // get all elements with attribute algolia-date
        const dates = document.querySelectorAll("[algolia-sort-date]");

        // create an array of unique dates
        let uniqueDates = [];
        // loop through each element
        dates.forEach((date) => {
            // create property with month name and value with year
            const monthName = monthNames[date.getAttribute("algolia-sort-date").split("-")[1]];
            const year = date.getAttribute("algolia-sort-date").split("-")[0];

            const monthYear = `${monthName} ${year}`;

            // push monthYear to uniqueDates array
            uniqueDates.push(monthYear);
            // remove duplicates from uniqueDates array
            uniqueDates = [...new Set(uniqueDates)];
        });

        // get all li items with class .ais-InfiniteHits-item
        const hitsItems = document.querySelectorAll(".ais-InfiniteHits-item");

        // create ol element
        let ol = document.createElement("ol");
        // add class months-list to ol
        ol.classList.add("months-list");

        // loop through each unique date
        uniqueDates.forEach((date) => {
            // create li element with month and year
            let li = monthSection(date.split(" ")[0], date.split(" ")[1]);
            // append li to ol
            ol.innerHTML += li;
        });

        // delete .ais-InfiniteHits-list
        document.querySelector(".ais-InfiniteHits-list").remove();

        // append ol to .ais-InfiniteHits
        document.querySelector(".ais-InfiniteHits").prepend(ol);


        let forEachCount = 0;

        // loop through each hit
        hitsItems.forEach((hit) => {
            // get algolia-category attribute value from direct child of hit
            let category = hit.children[0].getAttribute("algolia-category");

            // get algolia-sort-date attribute value from direct child of hit
            let date = hit.children[0].getAttribute("algolia-sort-date");

            // get month and year from date
            const monthName = monthNames[date.split("-")[1]];
            const year = date.split("-")[0];

            // if category is Timestamp
            if (category === "Timestamp") {
                // get element with attribute timestamps-wrapper and value of month and year
                let timestampsWrapper = document.querySelector(`[timestamps-wrapper="${monthName} ${year}"]`);
                // append hit to timestampsWrapper
                timestampsWrapper.appendChild(hit);
            } else {
                // get element with attribute episodes-wrapper and value of month and year
                let episodesWrapper = document.querySelector(`[episodes-wrapper="${monthName} ${year}"]`);
                // append hit to episodesWrapper
                episodesWrapper.appendChild(hit);
            }

            forEachCount++;
            if (forEachCount === hitsItems.length) {
                deleteEmpties();
            }

        });

        function deleteEmpties() {
            // get all children of allHits with attribute subtopic-section
            const subtopicSections = document.querySelectorAll("[subtopic-section]");

            function deleteEmptySubtopicSections() {
                // loop through each subtopic section
                subtopicSections.forEach((subtopicSection) => {
                    if (subtopicSection.hasAttribute("no-episodes") && subtopicSection.hasAttribute("no-timestamps")) {
                        subtopicSection.remove();
                    }
                });
            }

            let subtopicSectionsCount = 0;
            // loop through each subtopic section
            subtopicSections.forEach((subtopicSection) => {
                const episodesWrapper = subtopicSection.querySelector("[episodes-wrapper]");
                if (subtopicSection.querySelector("[episodes-wrapper]")) {
                    if (episodesWrapper.innerHTML === "") {
                        // add attribute no-episodes to subtopicSection
                        subtopicSection.setAttribute("no-episodes", "");
                        episodesWrapper.remove();
                    }
                }
                const timestampsWrapper = subtopicSection.querySelector("[timestamps-wrapper]");
                if (subtopicSection.querySelector("[timestamps-wrapper]")) {
                    if (timestampsWrapper.innerHTML === "") {
                        // add attribute no-timestamps to subtopicSection
                        subtopicSection.setAttribute("no-timestamps", "");
                        // remove timestampsWrapper parent element
                        timestampsWrapper.parentElement.remove();
                    }
                }
                subtopicSectionsCount++;
                if (subtopicSectionsCount === subtopicSections.length) {
                    deleteEmptySubtopicSections();
                }
            });
        }

    }


}
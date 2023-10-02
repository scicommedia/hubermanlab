// Algolia Search

const searchClient = algoliasearch(
    "7MTSAM17R6",
    "e53cb2eceea20be62c0ea021fe2f5d14"
);


let search = instantsearch({ indexName: "hubermandev", searchClient, insights: true, routing: true });

// Search With Search bar and and categories facet filters

search.addWidgets([
    instantsearch.widgets.searchBox({
        container: "#searchbox",
        placeholder: "What are you looking for?"
    }),

    instantsearch.widgets.refinementList({
        container: "#category-list",
        attribute: "category.name",
        sortBy: ["count:desc", "name:asc"],
        // use transformItems to change the label of the categories and make it plural
        transformItems: function (items) {
            return items.map(function (item) {
                switch (item.label) {
                    case "Guest Episode":
                        item.label = "Guest Episodes";
                        break;
                    case "Guest Series":
                        item.label = "Guest Series";
                        break;
                    case "Solo Episode":
                        item.label = "Solo Episodes";
                        break;
                    case "Timestamp":
                        item.label = "Timestamps";
                        break;
                    case "AMA":
                        item.label = "AMAs";
                        break;
                    case "Blueprint":
                        item.label = "Blueprints";
                        break;
                    default:
                        item.label = item.label;
                }
                return item;
            });
        }
    }),

    instantsearch.widgets.hits({
        container: "#hits",
        attributesToHighlight: ["name", "description"],
        templates: {
            item: function (hit) {
                return `
              <div onClick="${() => sendEvent('click', hit, 'Search Result Clicked')}" class="hit" algolia-category="${hit.category.name}" ${hit.subtopics
                        ? `algolia-subtopics='[${hit.subtopics
                            .map((subtopic) => `"${subtopic.name}"`)
                            .join(", ")}]'`
                        : ""
                    } algolia-sort-date="${hit.postDate}" episode-card>
                <a href="${hit.link}" class="hit-image" card-wrapper>
                  <img src="${hit.thumbnail}" alt="${hit.name}" />
                  <div class="u-img-cover" card-overlay></div>
                </a>
                <div class="hit-content">
                  <a href="${hit.link}" card-wrapper>
                    <div class="hit-category" card-opacity>${hit.category.name
                    }</div>
                    <p class="hit-title" card-title>${instantsearch.snippet({ attribute: "name", hit })}</p>
                  </a>
                  ${hit.itemsCount
                        ? `<p class="paragraph-x-small u-text-black-60">${hit.itemsCount}</p>`
                        : ""
                    }
                  <div class="topics-list">
                    ${hit.topics
                        ? hit.topics
                            .map(
                                (topic) =>
                                    `<a href="/topics/${topic.slug}" class="topic">${topic.shortName}</a>`
                            )
                            .join("")
                        : ""
                    }
                  </div>
                  ${hit.fromEpisode
                        ? `
                    <div class="paragraph-x-small u-text-black-60">From Episode</div>
                    <div class="paragraph-small u-mb-1">${hit.fromEpisode}</div>
                    <div class="paragraph-small u-text-black-60 u-mb-1" algolia-date>${hit.postDate}</div>
                  `
                        : ""
                    }
                  <div class="hit-description" card-description>${instantsearch.snippet({ attribute: "description", hit })}</div>
  
                </div>
              </div>
            `;
            }
        }
    }),

    instantsearch.widgets.pagination({
        container: "#pagination",
        padding: 2
    }),

    instantsearch.widgets.hitsPerPage({
        container: "#hits-per-page",
        items: [{ label: "10 hits per page", value: 10, default: true }]
    })
]);

search.on("render", function () {
    onRender();
});

search.start();

function onRender() {
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
}

window.onload = function () {
    const searchQuery = localStorage.getItem("searchQuery");

    if (searchQuery) {
        const searchInput = document.querySelector(".ais-SearchBox-input");
        if (searchInput) {
            searchInput.value = searchQuery;
            document.querySelector("#search-term").innerText = searchQuery;
            search.helper.setQuery(searchQuery).search();
            localStorage.removeItem("searchQuery");
        }
    }
};

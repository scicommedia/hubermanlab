const topicTitle = document.getElementById("subtopic-title").innerText;

// Algolia Search

const searchClient = algoliasearch(
  "7MTSAM17R6",
  "e53cb2eceea20be62c0ea021fe2f5d14"
);

const search = instantsearch({ indexName: "hubermandev_postDate_desc", searchClient });

// Search With Search bar and and categories facet filters

search.addWidgets([

  instantsearch.widgets.configure({
      filters: `subtopics.name:"${topicTitle}"`
  }),


  instantsearch.widgets.refinementList({
      container: "#category-list",
      attribute: "category.name",
      sortBy: ["count:desc", "name:asc"],
  }),

  instantsearch.widgets.hits({
      container: "#hits",
      templates: {
          item: `
          <div class="hit" episode-card algolia-category="{{category.name}}" algolia-subtopics='[{{#subtopics}}&#34;{{name}}&#34;, {{/subtopics}}]' algolia-sort-date="{{postDate}}">
              <a href="{{link}}" class="hit-image">
                  <img src="{{thumbnail}}" alt="{{name}}" />
              </a>
              <div class="hit-content">
                    <p class="hit-title"><a card-title class="u-text-black" href="{{link}}">{{name}}</a></p>
                    {{#fromEpisode}}
                      <div class="paragraph-x-small u-text-black-60">From Episode</div>
                      <div class="paragraph-small">{{fromEpisode}}</div>
                      <div class="paragraph-small u-text-black-60" algolia-date >{{postDate}}</div>
                    {{/fromEpisode}}
                    <div class="hit-category">{{category.name}}</div>
              </div>
          </div>
          `
      }
  }),

  instantsearch.widgets.pagination({
      container: "#pagination",
      padding: 2
  }),

  instantsearch.widgets.hitsPerPage({
      container: "#hits-per-page",
      items: [{ label: "10 hits per page", value: 10, default: true }]
  }),

  // add sortby widget
  instantsearch.widgets.sortBy({
      container: "#sort-by",
      items: [
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
        <li subtopic-section>
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
      let uniqueDates = {};
      // loop through each element
      dates.forEach((date) => {
          // create property with month name and value with year
          const monthName =
              monthNames[date.getAttribute("algolia-sort-date").split("-")[1]];
          const year = date.getAttribute("algolia-sort-date").split("-")[0];

          if (!uniqueDates[monthName]) {
              // push property with month name and value with year to uniqueDates
              uniqueDates[monthName] = year;
          }
      });

      // get all li items with class .ais-Hits-item
      const hitsItems = document.querySelectorAll(".ais-Hits-item");

      // create ol element
      let ol = document.createElement("ol");
      // add class months-list to ol
      ol.classList.add("months-list");

      // loop through each unique date
      for (const [month, year] of Object.entries(uniqueDates)) {
          // create li element with month and year
          let li = monthSection(month, year);
          // append li to ol
          ol.innerHTML += li;
      }
      // delete everything inside .ais-Hits
      document.querySelector(".ais-Hits").innerHTML = "";

      // append ol to .ais-Hits
      document.querySelector(".ais-Hits").appendChild(ol);

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

      });

      // get all children of allHits with attribute subtopic-section
      const subtopicSections = document.querySelectorAll("[subtopic-section]");
      // loop through each subtopic section
      subtopicSections.forEach((subtopicSection) => {
          const episodesWrapper = subtopicSection.querySelector("[episodes-wrapper]");
          if (episodesWrapper.innerHTML === "") {
              // add attribute no-episodes to subtopicSection
              subtopicSection.setAttribute("no-episodes", "");
              episodesWrapper.remove();
          }
          const timestampsWrapper = subtopicSection.querySelector("[timestamps-wrapper]");
          if (timestampsWrapper.innerHTML === "") {
              // add attribute no-timestamps to subtopicSection
              subtopicSection.setAttribute("no-timestamps", "");
              // remove timestampsWrapper parent element
              timestampsWrapper.parentElement.remove();
          }

          if (subtopicSection.hasAttribute("no-episodes") && subtopicSection.hasAttribute("no-timestamps")) {
              subtopicSection.remove();
          }
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

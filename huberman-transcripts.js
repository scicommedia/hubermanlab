// Algolia Search

const searchClient = algoliasearch(
  "7MTSAM17R6",
  "e53cb2eceea20be62c0ea021fe2f5d14"
);

const search = instantsearch({ indexName: "hubermandev_postDate_desc", searchClient });

// Search With Search bar and and categories facet filters

search.addWidgets([

  instantsearch.widgets.configure({
      filters:
          "hasTranscript:true"
  }),

  instantsearch.widgets.searchBox({
      container: "#searchbox",
      placeholder: "Search for a topic, guest, or keyword to filter the episode list below",
  }),

  instantsearch.widgets.refinementList({
    container: "#category-list",
    attribute: "category.name",
    sortBy: ["count:desc", "name:asc"]
  }),

  instantsearch.widgets.hits({
      container: "#hits",
      templates: {
          item: `
    <div class="hit" algolia-category="{{category.name}}" algolia-subtopics='[{{#subtopics}}&#34;{{name}}&#34;, {{/subtopics}}]' algolia-sort-date="{{postDate}}">
        <a href="{{link}}" class="hit-image">
          <img src="{{thumbnail}}" alt="{{name}}" />
        </a>
        <div class="hit-content">
          <div class="paragraph-small u-text-black u-mb-0-5" algolia-date >{{postDate}}</div>
          <p class="h7 u-mb-1" episode-card><a card-title class="u-text-black" href="{{link}}">{{name}}</a></p>
          <div>
              <a class="btn-outline u-mb-1" href="{{link}}?transcript=1">Read Transcript</a>
          </div>
        </div>
    </div>
    `
      }
  }),

  instantsearch.widgets.pagination({
      container: "#pagination",
      padding: 2,
      scrollTo: document.querySelector("#category-list")
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

  // add stats widget to show number in this format "Showing x of y episodes"
  instantsearch.widgets.stats({
    container: "#stats",
    templates: {
      text: `
        {{#hasNoResults}}No results{{/hasNoResults}}
        {{#hasOneResult}}1 episode{{/hasOneResult}}
        {{#hasManyResults}}{{#helpers.formatNumber}}{{nbHits}}{{/helpers.formatNumber}} episode transcripts are available{{/hasManyResults}}
      `
    }
  })

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

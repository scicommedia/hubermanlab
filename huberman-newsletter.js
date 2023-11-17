// Newsletter Page

const searchClient = algoliasearch(
  "7MTSAM17R6",
  "e53cb2eceea20be62c0ea021fe2f5d14"
);

const search = instantsearch({ indexName: "hubermandev_postDate_desc", searchClient });

search.addWidgets([

  instantsearch.widgets.configure({
    filters: "category.name:'Newsletter'"
  }),

  instantsearch.widgets.hits({
    container: "#hits",
    templates: {
      item: `
      <div class="hit" algolia-category="{{category.name}}" algolia-primarytopic="{{#primaryTopic}}{{name}}{{/primaryTopic}}" algolia-primarytopic-slug="{{#primaryTopic}}{{slug}}{{/primaryTopic}}">
          <a href="{{link}}" class="hit-image">
              <img src="{{thumbnail}}" alt="{{name}}" />
          </a>
          <div class="hit-content">
                <h3 class="hit-title"><a class="u-text-black" href="{{link}}">{{name}}</a></h3>
                <div class="hit-date" algolia-date>{{postDate}}</div>
          </div>
      </div>
      `
    }
  }),

  instantsearch.widgets.pagination({
    container: "#pagination",
    padding: 2,
    scrollTo: "#archive"
  }),

  instantsearch.widgets.hitsPerPage({
    container: "#hits-per-page",
    items: [{ label: "9 hits per page", value: 9, default: true }]
  }),

  // add sortby widget
  instantsearch.widgets.sortBy({
    container: "#sort-by",
    items: [
      { label: "Date: Newest first", value: "hubermandev_postDate_desc" },
      { label: "Date: Oldest first", value: "hubermandev_postDate_asc" }
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
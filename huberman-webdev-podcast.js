// Podcast Page

const searchClient = algoliasearch(
  "7MTSAM17R6",
  "e53cb2eceea20be62c0ea021fe2f5d14"
);

const latestBig = instantsearch({
  indexName: "hubermandev_postDate_desc",
  searchClient
});

// Search With Search bar and and categories facet filters

latestBig.addWidgets([
  instantsearch.widgets.configure({
      filters:
          "category.name:'Solo Episode' OR category.name:'Guest Episode' OR category.name:'Guest Series' OR category.name:'Journal Club' OR category.name:'AMA'"
  }),

  instantsearch.widgets.hits({
      container: "#hits",
      templates: {
          item: `
          <div class="hit latest-episode-grid" algolia-category="{{category.name}}" episode-card>
              <a href="{{link}}" class="u-aspect-thumbnail" card-wrapper>
                  <img class="u-img-cover" src="{{thumbnail}}" alt="{{name}}" />
                  <div class="u-img-cover" card-overlay></div>
              </a>
              <div class="hit-content">
                <a href="{{link}}" card-wrapper>
                  <div class="episode-chip-date-wrapper u-mb-0-75" card-opacity>
                    <div class="hit-category">{{category.name}}</div>
                    <p class="paragraph-small u-line-height-none u-text-black" algolia-date >{{postDate}}<p>
                  </div>
                  <h3 class="hit-title" card-title>{{name}}</h3>
                  <div class="description u-mb-0-5 u-text-black" card-opacity>{{description}}</div>
                </a>
                <div class="topics-list u-mb-1">
                {{#topics}}
                  <a href="/topics/{{slug}}" class="topic">{{shortName}}</a>
                {{/topics}}
                </div>
              </div>
          </div>
      `
      }
  }),

  instantsearch.widgets.hitsPerPage({
      container: "#hits-per-page",
      items: [{ label: "1 hits per page", value: 1, default: true }]
  }),

  // add sortby widget
  instantsearch.widgets.sortBy({
      container: "#sort-by",
      items: [
          { label: "Date - Newest first", value: "hubermandev_postDate_desc" },
      ]
  }),
]);

latestBig.on("render", function () {
  onRender();
});

latestBig.start();



// RECENT EPISODES

const recentEpisodes = instantsearch({
  indexName: "hubermandev_postDate_desc",
  searchClient
});

// Search With Search bar and and categories facet filters

recentEpisodes.addWidgets([

  instantsearch.widgets.configure({
      filters:
          "category.name:'Solo Episode' OR category.name:'Guest Episode' OR category.name:'Guest Series' OR category.name:'Journal Club' OR category.name:'AMA'"
  }),

  instantsearch.widgets.hits({
      container: "#hits-recent-episodes",
      templates: {
          item: `
      <div class="hit recent-episodes-grid" algolia-category="{{category.name}}" episode-card>
          <a href="{{link}}" class="u-aspect-thumbnail" card-wrapper>
              <img class="u-img-cover" src="{{thumbnail}}" alt="{{name}}" />
              <div class="u-img-cover" card-overlay></div>
          </a>
          <a href="{{link}}" class="hit-content" card-wrapper>
            <div class="episode-chip-date-wrapper u-mb-0-5" card-opacity>
            <div class="hit-category">{{category.name}}</div>
            <p class="paragraph-small u-line-height-none" algolia-date >{{postDate}}<p>
            </div>
            <h3 class="hit-title" card-title>{{name}}</h3>
          </a>
      </div>
      <div class="topics-list u-mb-1">
      {{#topics}}
        <a href="/topics/{{slug}}" class="topic">{{shortName}}</a>
      {{/topics}}
      </div>
      `
      }
  }),

  instantsearch.widgets.hitsPerPage({
      container: "#hits-per-page-recent-episodes",
      items: [{ label: "8 hits per page", value: 8, default: true }]
  }),

  // add sortby widget
  instantsearch.widgets.sortBy({
      container: "#sort-by-recent-episodes",
      items: [
          { label: "Date - Newest first", value: "hubermandev_postDate_desc" },
      ]
  }),
]);

recentEpisodes.on("render", function () {
  onRender();
});

recentEpisodes.start();


// RENDER FUNCTIONS


function onRender() {

  const algoliaDate = document.querySelectorAll('[algolia-date]');
  // loop through algoliaDate
  algoliaDate.forEach((date) => {
      // make format 2023-07-10 friendly
      const friendlyDate = new Date(date.textContent).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
          timeZone: 'UTC'
      });
      // set textContent to friendlyDate
      date.textContent = friendlyDate;
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
// All Episodes Page

const searchClient = algoliasearch(
  "7MTSAM17R6",
  "e53cb2eceea20be62c0ea021fe2f5d14"
);

const search = instantsearch({
  indexName: "hubermandev_postDate_desc",
  searchClient
});

// Search With Search bar and and categories facet filters

search.addWidgets([
  instantsearch.widgets.configure({
    filters:
      "category.name:'Solo Episode' OR category.name:'Guest Episode' OR category.name:'Guest Series' OR category.name:'Journal Club' OR category.name:'AMA'"
  }),

  instantsearch.widgets.refinementList({
    container: "#category-list",
    attribute: "category.name",
    sortBy: ["count:desc", "name:asc"],
    transformItems: function (items) {
      return items.filter(function (item) {
        item.label = item.label.replace("Solo Episode", "Solo Episodes");
        item.label = item.label.replace("Guest Episode", "Guest Episodes");
        item.label = item.label.replace("Guest Series", "Guest Series");
        item.label = item.label.replace("Timestamp", "Timestamps");
        item.label = item.label.replace("Topic", "Topics");
        item.label = item.label.replace("Newsletter", "Newsletters");
        return item;
      });
    }
  }),

  instantsearch.widgets.hits({
    container: "#hits",
    templates: {
      item: `
      <div class="hit" algolia-category="{{category.name}}" algolia-primarytopic="{{#primaryTopic}}{{name}}{{/primaryTopic}}" algolia-primarytopic-slug="{{#primaryTopic}}{{slug}}{{/primaryTopic}}" algolia-date="{{postDate}}"  episode-card>
          <a href="{{link}}" class="u-aspect-thumbnail" card-wrapper>
              <img class="u-img-cover" src="{{thumbnail}}" alt="{{name}}" />
              <div class="u-img-cover" card-overlay></div>
          </a>
          <div class="hit-content" card-wrapper>
            <div class="hit-category" card-opacity>{{category.name}}</div>
            <h3 class="hit-title" card-title><a class="u-text-black" href="{{link}}">{{name}}</a></h3>
            <div class="description" card-opacity><a class="u-text-black" href="{{link}}">{{description}}</a></div>
          </div>
      </div>
      <div class="topics-list">
        {{#topics}}
          <a href="/topics/{{slug}}" class="topic">{{shortName}}</a>
        {{/topics}}
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
      { label: "Topics: A-Z", value: "hubermandev_primaryTopic_asc" },
      { label: "Topics: Z-A", value: "hubermandev_primaryTopic_desc" }
    ]
  }),

  // add stats widget to show number in this format "Showing x of y episodes"
  instantsearch.widgets.stats({
    container: "#stats",
    templates: {
      text: `
        {{#hasNoResults}}No results{{/hasNoResults}}
        {{#hasOneResult}}1 episode{{/hasOneResult}}
        Showing
        {{hitsPerPage}} of
        {{#hasManyResults}}{{#helpers.formatNumber}}{{nbHits}}{{/helpers.formatNumber}} episodes{{/hasManyResults}}
      `
    }
  })
]);

search.on("render", function () {
  onRender();
});

search.start();

function onRender() {
  // const select with class .ais-SortBy-select
  const sortSelect = document.querySelector(".ais-SortBy-select");

  // get value of select
  const sortSelectValue = sortSelect.value;

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

  // if sortSelectValue is hubermandev_primaryTopic_asc or hubermandev_primaryTopic_desc
  if (
    sortSelectValue === "hubermandev_primaryTopic_asc" ||
    sortSelectValue === "hubermandev_primaryTopic_desc"
  ) {
    // visually group by topic
    // get element with class .ais-Hits
    const hits = document.querySelector(".ais-Hits");

    function topicSection(topic, slug) {
      return `
         <li>
            <h2><a href="/topics/${slug}" class="group-title">${topic}</a></h2>
            <ol algolia-topic="${topic}" class="ais-Hits-list">
            </ol>
         </li>
         `;
    }
    // get all elements with attribute algolia-primarytopic
    const primaryTopics = document.querySelectorAll("[algolia-primarytopic]");

    // create an array of unique topics
    let uniqueTopics = {};
    // loop through each element
    primaryTopics.forEach((topic) => {
      // create property with topic name and value with topic slug
      const topicName = topic.getAttribute("algolia-primarytopic");
      const topicSlug = topic.getAttribute("algolia-primarytopic-slug");

      if (!uniqueTopics[topicName]) {
        // push property with topic name and value with topic slug to uniqueTopics
        uniqueTopics[topicName] = topicSlug;
      }
    });

    // get all li items with class .ais-Hits-item
    const hitsItems = document.querySelectorAll(".ais-Hits-item");

    // delete everything inside hits
    hits.innerHTML = "";

    // create ol
    const ol = document.createElement("ol");
    // append ol to hits
    hits.appendChild(ol);
    // add class .topics-section to ol
    ol.classList.add("topics-section");

    // loop through each unique topic
    for (const [topic, slug] of Object.entries(uniqueTopics)) {
      // create li with topic name and slug
      const li = topicSection(topic, slug);
      // append li to ol
      ol.innerHTML += li;
    }

    hitsItems.forEach((hit) => {
      // if direct child of hit has attribute algolia-primarytopic get the topic name and add it to the corresponding topicSection
      if (hit.querySelector("[algolia-primarytopic]")) {
        const topicName = hit
          .querySelector("[algolia-primarytopic]")
          .getAttribute("algolia-primarytopic");
        const topicSection = document.querySelector(
          `[algolia-topic="${topicName}"`
        );
        topicSection.appendChild(hit);
      }
    });
  } else {
    // visually group by month
    // get element with class .ais-Hits
    const hits = document.querySelector(".ais-Hits");

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
        <li>
          <h2 class="h5 u-mb-1-5">${month} ${year}</h2>
          <ol algolia-month="${month} ${year}" class="ais-Hits-list">
          </ol>
        </li>
        `;
    }

    // get all elements with attribute algolia-date
    const dates = document.querySelectorAll("[algolia-date]");

    // create an array of unique dates
    let uniqueDates = {};
    // loop through each element
    dates.forEach((date) => {
      // create property with month name and value with year
      const monthName =
        monthNames[date.getAttribute("algolia-date").split("-")[1]];
      const year = date.getAttribute("algolia-date").split("-")[0];

      if (!uniqueDates[monthName]) {
        // push property with month name and value with year to uniqueDates
        uniqueDates[monthName] = year;
      }
    });

    // get all li items with class .ais-Hits-item
    const hitsItems = document.querySelectorAll(".ais-Hits-item");

    // delete everything inside hits
    hits.innerHTML = "";

    // create ol
    const ol = document.createElement("ol");
    // append ol to hits
    hits.appendChild(ol);
    // add class .topics-section to ol
    ol.classList.add("topics-section");

    // loop through each unique date
    for (const [month, year] of Object.entries(uniqueDates)) {
      // create li with month name and year
      const li = monthSection(month, year);
      // append li to ol
      ol.innerHTML += li;
    }

    hitsItems.forEach((hit) => {
      // if direct child of hit has attribute algolia-date get the month name and add it to the corresponding monthSection
      if (hit.querySelector("[algolia-date]")) {
        const monthName =
          monthNames[
            hit
              .querySelector("[algolia-date]")
              .getAttribute("algolia-date")
              .split("-")[1]
          ];
        const year = hit
          .querySelector("[algolia-date]")
          .getAttribute("algolia-date")
          .split("-")[0];
        const monthSection = document.querySelector(
          `[algolia-month="${monthName} ${year}"`
        );
        monthSection.appendChild(hit);
      }
    });
  }
}
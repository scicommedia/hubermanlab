// FAQs search


const indexFAQ = "huberman_faqs";

const { faqsAutocomplete } = autocomplete({
  container: "#faq-autocomplete",
  placeholder: "What are you looking for?",
  panelContainer: "#faq-autocomplete-results",
  detachedMediaQuery: "none",
  openOnFocus: true,
  getSources({ query, state }) {
    if (!query) {
      return [];
    }

    return [
      {
        sourceId: "faqs",
        getItems() {
          return getAlgoliaResults({
            searchClient: searchClientLive,
            queries: [
              {
                indexName: indexFAQ,
                query,
                params: {
                  hitsPerPage: 5
                }
              }
            ]
          });
        },
        templates: {
          item({ item, components, html }) {
            return html`<a class="aa-ItemLink" href="${item.link}" slug="${item.slug}">
              <div class="aa-ItemContent">
                <div class="aa-ItemContentBody">
                  <div class="aa-ItemContentTitle">
                    ${components.Snippet({ hit: item, attribute: "name" })}
                  </div>
                </div>
              </div>
            </a>`;
          },
          noResults() {
            return "Please try a different word or phrase";
          }
        },
        getItemUrl({ item }) {
          return item.link;
        },
        onActive({ item, setContext }) {
          document.addEventListener("keydown", function (e) {
            if (e.key === "Enter") {
              window.location.href = item.link;
            }
          });
        },
      }
    ];
  }
});
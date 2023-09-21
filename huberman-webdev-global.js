const { autocomplete, getAlgoliaResults } = window["@algolia/autocomplete-js"];
const appId = "7MTSAM17R6";
const apiKey = "e53cb2eceea20be62c0ea021fe2f5d14";
const searchClientLive = algoliasearch(appId, apiKey);
const indexName = "hubermandev";

const { setIsOpen } = autocomplete({
  container: "#autocomplete",
  placeholder: "What are you looking for?",
  panelContainer: "#autocomplete-results",
  detachedMediaQuery: "none",
  openOnFocus: true,
  onStateChange({ state }) {
    const searchInput = document.querySelector("#autocomplete");
    searchInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        localStorage.setItem("searchQuery", state.query);
        window.location.href = "/search-results";
      }
    });
    const searchButton = searchInput.querySelector(".aa-SubmitButton")
    searchButton.addEventListener("click", function () {
      localStorage.setItem("searchQuery", state.query);
      window.location.href = "/search-results";
    });
  },
  getSources({ query, state }) {
    if (!query) {
      return [];
    }

    return [
      {
        sourceId: "episodes",
        getItems() {
          return getAlgoliaResults({
            searchClient: searchClientLive,
            queries: [
              {
                indexName: indexName,
                query,
                params: {
                  hitsPerPage: 10
                }
              }
            ]
          });
        },
        templates: {
          item({ item, components, html }) {
            return html`<a class="aa-ItemLink" href="${item.link}">
              <div class="aa-ItemContent">
                <div class="aa-ItemContentBody">
                  <div class="aa-ItemContentTitle">
                    ${components.Snippet({ hit: item, attribute: "name" })}
                  </div>
                  <div class="aa-ItemContentSubtitle">
                    ${item.category.name}
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
        }
      }
    ];
  }
});


if (document.getElementById('inline-autocomplete')) {
  const { inlineAutocomplete } = autocomplete({
    container: "#inline-autocomplete",
    placeholder: "What are you looking for?",
    panelContainer: "#inline-autocomplete-results",
    detachedMediaQuery: "none",
    openOnFocus: true,
    onStateChange({ state }) {
      const searchInput = document.querySelector("#inline-autocomplete");
      searchInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          localStorage.setItem("searchQuery", state.query);
          window.location.href = "/search-results";
        }
      });
      const searchButton = searchInput.querySelector(".aa-SubmitButton")
      searchButton.addEventListener("click", function () {
        localStorage.setItem("searchQuery", state.query);
        window.location.href = "/search-results";
      });
    },
    getSources({ query, state }) {
      if (!query) {
        return [];
      }

      return [
        {
          sourceId: "episodes",
          getItems() {
            return getAlgoliaResults({
              searchClient: searchClientLive,
              queries: [
                {
                  indexName: indexName,
                  query,
                  params: {
                    hitsPerPage: 10
                  }
                }
              ]
            });
          },
          templates: {
            item({ item, components, html }) {
              return html`<a class="aa-ItemLink" href="${item.link}">
                <div class="aa-ItemContent">
                  <div class="aa-ItemContentBody">
                    <div class="aa-ItemContentTitle">
                      ${components.Snippet({ hit: item, attribute: "name" })}
                    </div>
                    <div class="aa-ItemContentSubtitle">
                      ${item.category.name}
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
          }
        }
      ];
    }
  });
}

// Episode release time

// let episodesReleaseTime = moment.tz("2014-06-01T09:00:00Z", "America/Los_Angeles");

// function getVisitorTimezone() {
//   // Get the visitor's local timezone in TZ identifier format
//   const visitorTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
//   return visitorTimezone;
// }

// const visitorTimezone = getVisitorTimezone();

// let localReleaseTime = episodesReleaseTime.clone().tz(visitorTimezone).format('ha z');

// const time = document.getElementById('local-release-time');
// const ptReleaseTime = document.getElementById('pt-release-time');

// time.innerText = localReleaseTime;

// if (visitorTimezone === "America/Los_Angeles") {
//   ptReleaseTime.remove();
// }

// Top Banner

if (document.querySelector('[top-banner]')) {

  // const topBanner attriubute banner-expiration
  const topBanner = document.querySelector('[top-banner]');

  // get attribute banner-expiration from topBanner
  const bannerExpiration = topBanner.getAttribute('banner-expiration');

  const today = new Date();
  // transform today to number of the year

  // check if hubermanBannerDate exists local storage
  if (localStorage.getItem('hubermanBannerDate')) {
      // get hubermanBannerDate from local storage
      const hubermanBannerDate = localStorage.getItem('hubermanBannerDate');
      const difference = Math.floor((Date.parse(today) - Date.parse(hubermanBannerDate)) / 86400000);
      // check if difference is bigger than bannerExpiration
      if (difference > bannerExpiration) {
          // set hubermanBannerDate to local storage
          localStorage.setItem('hubermanBannerDate', today);
          // add class top-banner--hidden
          topBanner.classList.add('cc-open');
      }

  } else {
      topBanner.classList.add('cc-open');
  }

  // const closeBannerButton attribute close-banner-button
  const closeBannerButton = document.querySelector('[close-banner-button]');
  // add event listener click to closeBannerButton
  closeBannerButton.addEventListener('click', () => {
      // add class top-banner--hidden
      topBanner.classList.add('cc-close');
      // set hubermanBannerDate to local storage
      localStorage.setItem('hubermanBannerDate', today);
      // remove topBanner after 1s
      setTimeout(() => {
          topBanner.remove();
      }, 1000);

  });
}

// Move content into gated wrapper

// get all elements with attribute gated-content
const gatedContent = document.querySelectorAll('[gated-content]');

// if gatedContent is not empty
if (gatedContent.length > 0) {
    gatedContent.forEach((element) => {
        // get the value of the attribute
        const gatedContentValue = element.getAttribute('gated-content');

        // get the element with the same value as the attribute
        const gatedContentWrapperElement = document.querySelector(`[gated-content-wrapper="${gatedContentValue}"]`);

        // if the element exists
        if (gatedContentWrapperElement) {
            // get innerHTML of the element
            const content = element.innerHTML;

            // append the content to gatedContentWrapperElement
            gatedContentWrapperElement.innerHTML = content;
        }

        // remove the element
        element.remove();
            
        Webflow.require('ix2').init();
    });
}

// const supercastLogin attribute supercast="login"
const supercastLogin = document.querySelectorAll('[supercast="login"]');

supercastLogin.forEach((element) => {
    element.addEventListener("click", (event) => {
      Supercast.startLogin({subdomain: "hubermanlab"})
    });
}
);

// Supercast log out
let logout = document.querySelector('[supercast-logout]');

if (logout) {
    logout.addEventListener('click', function() {
        document.cookie = '_supercast_session=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        window.location.href = '/';
    });
}



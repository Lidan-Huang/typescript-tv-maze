import axios from "axios";
import * as $ from 'jquery';

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");
const $episodesList = $("#episodesList");

const MISSING_IMAGE_URL = "./defaultImg.png";
const BASIC_URL = "https://api.tvmaze.com/";

interface IShowFromApi {
  id: number,
  name: string,
  summary: string,
  image: { medium: string } | null
}

interface IShow extends Omit<IShowFromApi, "image"> {
  image: string
}

interface IEpisode {
  id: number,
  name: string,
  season: string,
  number: string
}

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term: string): Promise<IShow[]> {
  // ADD: Remove placeholder & make request to TVMaze search shows API.
  const res = await axios.get(`${BASIC_URL}search/shows?q=${term}`);
  
  return res.data.map((item:{ show: IShowFromApi}) :IShow => {
    const show = item.show;
    return {
      id: show.id,
      name: show.name,
      summary: show.summary,
      image: show.image?.medium || MISSING_IMAGE_URL
    };
  });
}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows:IShow[]) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
        `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src= "${show.image}"
              alt="${show.name}"
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() : Promise<void> {
  const term : string = $("#searchForm-term").val() as string;
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id:number) {
  const res = await axios.get(`${BASIC_URL}shows/${id}/episodes`);
  return res.data.map((item:IEpisode) => {
    return {
      id: item.id,
      name: item.name,
      season: item.season,
      number: item.number
    }
  });
}

/** Get a list of episodes, create markup for each and to DOM 
 */

function populateEpisodes(episodes:IEpisode[]) { 
  $episodesList.empty();

  for (let episode of episodes) {
    const $episode = $(`
      <li> 
        ${episode.name} (season ${episode.season}, number ${episode.number})
      </li>
    `);
    $episodesList.append($episode);
  }

  $episodesArea.show();
}


/**Handle episodes button, after click, show the episodes of the show 
 */

async function getEpisodesAndDisplay(evt: JQuery.ClickEvent) : Promise<void>{
  const showId : number = $(evt.target).closest('.Show').data('show-id');
  const episodes : IEpisode[] = await getEpisodesOfShow(showId);
  populateEpisodes(episodes);
}

$showsList.on("click", ".Show-getEpisodes", getEpisodesAndDisplay);
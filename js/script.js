console.log("Lets Write JavaScript");
let currentSong = new Audio();
let songs;
let currFolder;
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    var minutes = Math.floor(seconds / 60);
    var remainingSeconds = Math.floor(seconds % 60);

    // Formatting to ensure that single digit seconds or minutes are displayed with leading zero
    var formattedMinutes = String(minutes).padStart(2, "0");
    var formattedSeconds = String(remainingSeconds).padStart(2, "0");

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    

    //show all the songs in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML =
            songUL.innerHTML +
            `<li><img class="invert" src="img/music.svg" alt="">
                              <div class="info">
                                  <div>${song.replaceAll("%20", " ")}</div>
                                  <div>Amit</div>
                              </div>
                                  <div class="playnow">
                                      <span>Play Now</span>
                                      <img class="invert" src="img/play.svg" alt="">
                              </div> </li>`;
    }

    //Attach an event listener to each song
    Array.from(
        document.querySelector(".songList").getElementsByTagName("li")
    ).forEach((e) => {
        e.addEventListener("click", (element) => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML);
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        });
    });
    return songs;
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track;
    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};
async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:5500/songs/`)
    let response = await a.text();   
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs/")&& !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-2)[1];
            // Get the metaData of the folder
            let a = await fetch(`/songs/${folder}/info.json`);
            let response = await a.json();
            cardContainer.innerHTML = cardContainer.innerHTML + ` <div data-folder="${folder}" class="card">
    <div class="play">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="bg-black"
            xmlns="http://www.w3.org/2000/svg">
            <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" stroke-width="1.5"
                stroke-linejoin="round" />
        </svg>
    </div>
    <img src="/songs/${folder}/cover.jpg" alt="" />
    <h2>${response.title}</h2>
    <p>${response.description}</p>
</div>`
        }
    }

    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0])
        });
    });
}

async function main() {
    //Get the list of all the songs
    await getSongs("songs/ncs");
    playMusic(songs[0], true);

    //Display all the albums on the page
    await displayAlbums();

    //Attach an event listener to play, next and previous
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg";
        } else {
            currentSong.pause();
            play.src = "img/play.svg";
        }
    });

    //Listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        // console.log(currentSong.currentTime,currentSong.duration);
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(
            currentSong.currentTime
        )} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left =
            (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    //Add an event listener to a seek bar
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    //Add an event Listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });
    //Add an event Listener for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    // Add an event Listener to previous
    previous.addEventListener("click", () => {
        console.log("Previous");
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if (index - 1 >= 0) {
            playMusic(songs[index - 1]);
        }
    });
    // Add an event Listener to next
    next.addEventListener("click", () => {
        currentSong.pause();
        console.log("Next");
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        console.log(index)
        if (index + 1 < songs.length) {
            playMusic(songs[index + 1]);
        } else {
            playMusic(songs[0]);
        }
    });

    // Add an event Listener to vloume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
            console.log(e, e.target, e.target.value);
            currentSong.volume = parseInt(e.target.value) / 100;
            if(currentSong.volume==0)
            {
                document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("volume.svg","mute.svg")
            }
            if(currentSong.volume>0){
                document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg","volume.svg")
            }
        });

        //Add an event Listener to Mute the track
        document.querySelector(".volume>img").addEventListener("click",e=>{
            if (e.target.src.includes("img/volume.svg")) {
                e.target.src = e.target.src.replace("img/volume.svg","img/mute.svg") 
                currentSong.volume = 0;
                document.querySelector(".range").getElementsByTagName("input")[0].value=0;
            }else{
                e.target.src = e.target.src.replace("img/mute.svg","img/volume.svg")
                document.querySelector(".range").getElementsByTagName("input")[0].value=10;
                currentSong.volume = .10;
            }
        })

}

main();

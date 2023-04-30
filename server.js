const express = require('express');
const axios = require('axios');
const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.get('/search', (req, res) => {
    res.render('search', {movieDetails:''});
});

app.post('/search', (req, res) => {
    let userMovieTitle = req.body.movieTitle;

    let movieUrl = `https://api.themoviedb.org/3/search/movie?api_key=0daec713ad8428a0c38e8498347a8730&query=${userMovieTitle}`;
    let genres = 'https://api.themoviedb.org/3/genre/movie/list?api_key=0daec713ad8428a0c38e8498347a8730&language=en-US';
   
    let endpoints = [movieUrl, genres];

    axios.all(endpoints.map((endpoint) => axios.get(endpoint)))
    .then(
        axios.spread((movie, genres) => {
            const movieRaw = movie.data.results;
            const movieGenreIds = movieRaw.genre_ids;        
            const movieGenres = genres.data.genres; 
            
            let genresArray = [];
            for(let i = 0; i < movieGenreIds.length; i++) {
                for(let j = 0; j < movieGenres.length; j++) {
                    if(movieGenreIds[i] === movieGenres[j].id) {
                        console.log(movieGenres[j].name);
                        genresArray.push(movieGenres[j].name)
                    }
                    
                }
            }

            let genresToDisplay = '';
            genresArray.forEach(genre => {
                genresToDisplay = genresToDisplay+ `${genre}, `;
            });

            genresToDisplay = genresToDisplay.slice(0, -2) + '.';
            
            let movieData = {
                title: movieRaw.original_title,
                year: new Date(movieRaw.release_date).getFullYear(),
                overview: movieRaw.overview,
                posterUrl: `https://image.tmdb.org/t/p/w500/${movieRaw.poster_path}`,
                genres: genresToDisplay

            };

            res.render('search', {movieDetails: movieData});
        })
      );
    
});

app.listen(process.env.PORT || 5000, () => {
    console.log('server is running');
});


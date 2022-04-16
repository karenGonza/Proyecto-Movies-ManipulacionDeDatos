const db = require('../database/models');
const sequelize = db.sequelize;
const { validationResult } = require('express-validator')

//Otra forma de llamar a los modelos
const Movies = db.Movie;

const moviesController = {
    'list': (req, res) => {
        db.Movie.findAll()
            .then(movies => {
                res.render('moviesList.ejs', { movies })
            })
    },
    'detail': (req, res) => {
        db.Movie.findByPk(req.params.id)
            .then(movie => {
                res.render('moviesDetail.ejs', { movie });
            });
    },
    'new': (req, res) => {
        db.Movie.findAll({
            order: [
                ['release_date', 'DESC']
            ],
            limit: 5
        })
            .then(movies => {
                res.render('newestMovies', { movies });
            });
    },
    'recomended': (req, res) => {
        db.Movie.findAll({
            where: {
                rating: { [db.Sequelize.Op.gte]: 8 }
            },
            order: [
                ['rating', 'DESC']
            ]
        })
            .then(movies => {
                res.render('recommendedMovies.ejs', { movies });
            });
    }, //Aqui debemos modificar y completar lo necesario para trabajar con el CRUD
    add: function (req, res) {
        res.render("moviesAdd")
    },
    create: async (req, res) => {
        let { title, rating, awards, release_date, length } = req.body;

        const errors = validationResult(req);

        try {
            if (errors.isEmpty()) {
                let newMovie = db.Movie.create({
                    title,
                    rating,
                    release_date,
                    awards,
                    length
                });
                res.redirect("/movies");
            } else {
                res.render("moviesAdd", {
                    old: req.body,
                    errors: errors.mapped(),
                });
            };
        } catch (error) {
            res.send(error.message);
        }
    },
    edit: async (req, res) => {
        let idMovieToSearch = req.params.id;
        try {
            let Movie = await db.Movie.findByPk(idMovieToSearch);
            res.render("moviesEdit", {
                Movie
            });
        } catch (error) {
            res.send(error.message);
        }
    },
    update: async (req, res) => {
        let idMovieToSearch = req.params.id;
        let { title, rating, awards, release_date, length } = req.body;
        const errors = validationResult(req);

        try {
            if (errors.isEmpty()) {
                await db.Movie.update({
                    title,
                    rating,
                    release_date,
                    awards,
                    length
                }, {
                    where: {
                        id: idMovieToSearch
                    }
                });
                res.redirect("/movies");
            } else {
                let Movie = await db.Movie.findByPk(idMovieToSearch);
                res.render("moviesEdit", {
                    Movie,
                    errors: errors.mapped()
                });
            };
        } catch (error) {
            res.send(error.message);
        }
    },
    delete: async (req, res) => {
        let MovieSearch = req.params.id;
        try {
            let Movie = await db.Movie.findByPk(MovieSearch);
            res.render("moviesDelete", {
                Movie
            });
        } catch (error) {
            res.send(error.message);
        };
    },
    destroy: async (req, res) => {
        let idMovieToDelete = req.params.id;
        try {
            await db.Movie.destroy({
                where: {
                    id: idMovieToDelete
                }
            });
            res.redirect("/movies");
        } catch (error) {
            res.send(error.message)
        };

        // No funciona siempre bien ya que las peliculas que se encuentran originalmente en la base de datos tiene asociaciones
        // las cuales deberian eliminarse primero

    }

}

module.exports = moviesController;
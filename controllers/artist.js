'use strict'

// upload && save image
const fs = require('fs');
const path = require('path');
const mongoosePaginate = require('mongoose-pagination')

const Artist = require('../models/artist');
const Album = require('../models/album');
const Song = require('../models/song');

function testArtist(req,res){
    res.status(200).send({message: "Controllador artist Ok"})
}

function saveArtist(req, res){
    var artist = new Artist();

    var params = req.body;
    artist.name = params.name;
    artist.description = params.description;
    artist.image = 'null';
    artist.style = params.style;

    artist.save((err, artistStored) => {
        if(err){
            res.status(500).send({message: "Error en sauvegardant artiste"})
        }else{
            if(!artistStored){
                res.status(404).send({message: "Artiste non enregistre"})
            }else{
                res.status(200).send({artist: artistStored })
            }
        }
    })
}

function getArtist(req,res){
    var artistId = req.params.id;

   Artist.findById(artistId, (err, artist) => {
    if(err){
        res.status(500).send({message: "Erreur requete"})
    }else{
        if(!artist){
            res.status(404).send({message: "Artiste non existant"})
        }else{
            res.status(200).send({artist})
        }
    }
   })
}

function getAllArtists(req, res){
    if(req.params.page){
         var page = req.params.page;
    }else{
        var page = 1;
    }
    var itemsPerPage = 3;

    Artist.find().sort('name').paginate(page, itemsPerPage, (err, artists, total) => {
        if(err){
            res.status(500).send({message: "Erreur requete"});
        }else{
            if(!artists){
                res.status(404).send({message: "Aucun artistes"});
            }else{
                return res.status(200).send({
                    total_items: total,
                    artists: artists
                })
            }
        }
    })
}

function updateArtist(req, res){
    var artistId = req.params.id;
    var update = req.body;

    Artist.findByIdAndUpdate(artistId, update, (err, artistUpdated) => {
        if(err){
            res.status(500).send({message: "Erreur requete"});
        }else{
            if(!artistUpdated){
                res.status(404).send({message: "Artiste non actualiser"})
            }
            res.status(200).send({artist: artistUpdated})
        }
    })
}

function deleteArtist(req, res){
    var artistId = req.params.id;

    Artists.findByIdAndDelete(artistId, (err, artistRemoved) => {
        if(err){
            res.status(500).send({message:"Server error"});
        }else{
            if(!artistRemoved){
                res.status(404).send({message:"Artist wasn't deleted"});
            }else{
                // ---- DELETE ON CASCADE -----

                //res.status(404).send({artistRemoved});
                // Delete all albums
                Album.find({artist: artistRemoved._id}).deleteOne((err, albumRemoved)=>{
                    if(err){
                        res.status(500).send({message:"Album cannot be deleted"});
                    }else{
                        if(!albumRemoved){
                            res.status(404).send({message:"Album wasn't deleted"});
                        }else{
                            //res.status(404).send({message: "Album removed"});
                            // Delete all songs
                            Song.find({album: albumRemoved._id}).deleteOne((err, songRemoved) =>{
                                if(err){
                                    res.status(500).send({message:"Song cannot be deleted"});
                                }else{
                                    if(!songRemoved){
                                        res.status(404).send({message:"Song wasn't deleted"});
                                    }else{
                                        res.status(200).send({artist: artistRemoved});
                                    }
                                }
                            });
                        }
                    }
                });
            }
        }
    });
}

function getImageFile(req, res){
    // Get image file from POST
    var imageFile = req.params.imageFile;

    var path_file = './uploads/artists/'+imageFile;

    // Verify if file exists
    fs.exists(path_file, function(exists){
        // Verify if callback's param is correct
        if(exists){
            res.sendFile(path.resolve(path_file));
        }else{
            res.status(404).send({message:"Image not found"});
        }
    });
}



module.exports = {
    testArtist,
    saveArtist,
    getArtist,
    getAllArtists,
    updateArtist,
    deleteArtist,
    getImageFile
}
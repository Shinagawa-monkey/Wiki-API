//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
// const ejs = require("ejs");
const port = 3000;
const app = express();

// app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));

// app.use(express.static('public'));

main().catch(err => console.log(err));
async function main() {
  await mongoose.connect('mongodb://localhost:27017/wikiDB');
};

const articleSchema = new mongoose.Schema({
  title: String,
  content: String
});

const Article = mongoose.model('Article', articleSchema);

// Requests targeting all articles
app.route('/articles')
  .get((req, res) => {
    Article.find({}, (err, foundArticles) => {
      if (!err) {
        res.send(foundArticles);
      } else {
        res.send(err);
      };
    });
  })
  .post((req, res) => {
    const newArticle = new Article({
      title: req.body.title,
      content: req.body.content
    });
    newArticle.save((err) => {
      if (!err) {
        res.send("Successfully added a new article.");
      } else {
        res.send(err);
      }
    });
  })
  .delete((req, res) => {
    Article.deleteMany({}, err => {
      if (!err) {
        res.send("Successfully deleted all articles.");
      } else {
        res.send(err);
      }
    });
  });

// Refactoring code with app.route() method

// app.get('/articles', (req, res) => {
//   // res.send('Hello World!');
//   Article.find({}, (err, foundArticles) => {
//     //console.log(foundArticles);
//     if(!err) {
//       res.send(foundArticles);
//     } else {
//       res.send(err);
//     };
//   });
// });
//
// app.post('/articles', (req, res) => {
//   // console.log(req.body.title);
//   // console.log(req.body.content);
//   const newArticle = new Article({
//     title: req.body.title,
//     content: req.body.content
//   });
//   newArticle.save((err) => {
//     if (!err) {
//       res.send("Successfully added a new article.");
//     } else {
//       res.send(err);
//     }
//   });
// });
//
// app.delete('/articles', (req, res) => {
//   Article.deleteMany({}, err => {
//     if (!err) {
//       res.send("Successfully deleted all articles.");
//     } else {
//       res.send(err);
//     }
//   });
// });


// Requests targeting a specific article
/* In delete metho I used result - an object that has properties where you can see the status of
the update or delete operation such as modifiedCount or matchedCount and deletedCount */
app.route('/articles/:articleTitle')
  .get((req, res) => {
    Article.findOne({
      title: {
        $regex: new RegExp("^" + req.params.articleTitle.toLowerCase(), "i")
      }
    }, (err, foundArticle) => {
      if (foundArticle) {
        res.send(foundArticle);
      } else {
        res.send("No articles matching that title was found.");
      }
    });
  })
  .put((req, res) => {
    Article.replaceOne({
        title: {
          $regex: new RegExp("^" + req.params.articleTitle.toLowerCase(), "i")
        }
      }, {
        title: req.body.title,
        content: req.body.content
      },
      (err) => {
        if (!err) {
          res.send("Successfully updated article.");
        } else {
          res.send(err);
        }
      }
    );
  })
  .patch((req, res) => {
    Article.updateOne({
        title: {
          $regex: new RegExp("^" + req.params.articleTitle.toLowerCase(), "i")
        }
      }, req.body,
      (err) => {
        if (!err) {
          res.send("Successfully updated desired part of the article.");
        } else {
          res.send(err);
        }
      }
    );
  })
  .delete((req, res) => {
    Article.deleteOne({
      title: {
        $regex: new RegExp("^" + req.params.articleTitle.toLowerCase(), "i")
      }
    }, (err, result) => {
      if (!err) {
        if (!err) {
          if (result.deletedCount === 1) {
            res.send("Successfully deleted article");
          } else {
            res.send("Article not found!");
          }
        } else {
          res.send(err);
        }
      }
    });
  });

app.listen(port, () => {
  console.log(`Server has started successfully on port ${port}`);
});

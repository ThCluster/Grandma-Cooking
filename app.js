// ===================== IMPORTATIONS ==================

// Ici on prend EXPRESS. C'est lui le patron du serveur.
// Quand navigateur parle avec ton app, c'est express qui gère ça.
import express from "express";

// Mongoose c'est le pont entre ton application et MongoDB.
// Sans ça ton app ne peut pas parler avec la base de données.
import mongoose from "mongoose";

// bodyParser permet de lire ce que l'utilisateur tape dans les formulaires.
// Sinon req.body serait vide.
import bodyParser from "body-parser";

// methodOverride permet d'utiliser PUT et DELETE dans les formulaires HTML.
// Parce que HTML connait seulement GET et POST.
import methodOverride from "method-override";

// flash sert à envoyer petits messages rapides.
// Genre : "connexion réussie", "erreur", etc.
import flash from "connect-flash";

// session permet de garder utilisateur connecté.
// Sinon à chaque page il devrait login encore.
import session from "express-session";

// passport gère toute la logique de login.
import passport from "passport";

// plugin qui aide à gérer username + password avec mongoose.
import passportLocalMongoose from "passport-local-mongoose";

// rand-token sert à générer un token aléatoire.
// Utile quand utilisateur veut reset son mot de passe.
import randToken from "rand-token";

// nodemailer sert à envoyer des mails.
import nodemailer from "nodemailer";

// ================= IMPORT DES MODELES =================

// ici on importe les schemas MongoDB que tu as créés
import User from "./models/user.js";
import Reset from "./models/reset.js";
import Receipe from "./models/receipe.js";
import ProgrRecette from "./models/schedule.js";
import Ingredient from "./models/ingredient.js";
import Favorites from "./models/favorites.js";
import Schedule from "./models/schedule.js";

// ici on crée l'application express
const app = express();

// ================= CONFIGURATION APP =================

// ici on dit que le dossier public contient css images js etc
app.use(express.static("public"));

// body parser permet de lire données formulaire
app.use(bodyParser.urlencoded({ extended: true }));

// ================= SESSION =================

// la session garde utilisateur connecté
app.use(
  session({
    secret: "mysecret", // clé secrète pour sécuriser session
    resave: false,
    saveUninitialized: false,
  }),
);

// ================= PASSPORT =================

// on initialise passport
app.use(passport.initialize());

// passport utilise aussi les sessions
app.use(passport.session());

// ================= FLASH MESSAGE =================

// activation flash
app.use(flash());

// ici on rend variables accessibles dans toutes les vues
app.use((req, res, next) => {
  res.locals.currentUser = req.user; // utilisateur connecté
  res.locals.error = req.flash("error"); // message erreur
  res.locals.success = req.flash("success"); // message succès
  next();
});

// moteur de template
app.set("view engine", "ejs");

// ================= CONNEXION BASE DE DONNEES =================

async function connectDB() {
  try {
    // connexion à MongoDB Atlas
    await mongoose.connect(
      "mongodb+srv://Andreoli123:Andreoli123@cluster0.aebxl.mongodb.net/test",
    );

    console.log("BD connectée"); // si ça marche
  } catch (error) {
    console.error("BD non connectée :", error.message); // si ça plante
  }
}

connectDB();

// ================= CONFIGURATION PASSPORT =================

// stratégie login username + password
passport.use(User.createStrategy());

// comment passport sauvegarde user dans session
passport.serializeUser(User.serializeUser());

// comment passport récupère user depuis session
passport.deserializeUser(User.deserializeUser());

// ================= ROUTES =================

// ================= PAGE ACCUEIL =================

app.get("/", (req, res) => {
  console.log(req.user); // montre utilisateur connecté
  res.render("index");
});

app.get("/about", (req, res) => {
  console.log(req.user);
  res.render("About");
});

// ================= DASHBOARD =================

// isLoggedIn est un garde du corps
// si utilisateur pas connecté il bloque l'accès
app.get("/dashboard", isLoggedIn, (req, res) => {
  res.render("dashboard");
  console.log(req.user);
  console.log("Utilisateur connecté");
});

// ================= AUTHENTIFICATION =================

// page signup
app.get("/signup", (req, res) => {
  res.render("signup");
});

// inscription utilisateur
app.post("/signup", async (req, res) => {
  try {
    const newUser = new User({
      username: req.body.username,
    });

    // enregistre user avec password crypté
    const registeredUser = await User.register(newUser, req.body.password);

    // login automatique après inscription
    passport.authenticate("local")(req, res, () => {
      res.redirect("/login");
    });
  } catch (err) {
    console.log("Erreur inscription :", err);
    res.render("signup");
  }
});

// ================= LOGIN =================

// page login
app.get("/login", (req, res) => {
  res.render("login");
});

// traitement login
app.post("/login", async (req, res) => {
  try {
    const user = new User({
      username: req.body.username,
      password: req.body.password,
    });

    req.login(user, (err) => {
      if (err) {
        console.log("Erreur création session :", err);
        return res.redirect("/login");
      }

      passport.authenticate("local", (err, user, info) => {
        if (err) {
          console.log("Erreur auth :", err);
          return res.redirect("/login");
        }

        if (!user) {
          console.log("Utilisateur ou mot de passe incorrect");
          return res.redirect("/login");
        }

        req.logIn(user, (err) => {
          if (err) {
            console.log("Impossible de loguer l'utilisateur :", err);
            return res.redirect("/login");
          }

          req.flash("success", "Congratulations of the site");

          console.log("Connexion réussie !");
          return res.redirect("/dashboard");
        });
      })(req, res);
    });
  } catch (error) {
    console.log("Erreur inattendue :", error);
    res.redirect("/login");
  }
});

// ================= LOGOUT =================

// déconnexion utilisateur
app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      console.log("Erreur logout :", err);
      return res.redirect("/");
    }
    req.flash("success", "Aurevoir et à la prochaine !!");
    console.log("Utilisateur déconnecté");
    res.redirect("/login");
  });
});

// ================= RESET PASSWORD =================

// page forgot
app.get("/forgot", (req, res) => {
  res.render("forgot");
});

// utilisateur demande reset password
app.post("/forgot", async (req, res) => {
  try {
    const userFound = await User.findOne({
      username: req.body.username,
    });

    if (!userFound) {
      console.log("Utilisateur introuvable");
      return res.redirect("/forgot");
    }

    console.log("Information validée");

    const token = randToken.generate(16);

    await Reset.create({
      username: userFound.username,
      resetPasswordToken: token,
      resetPasswordExpires: Date.now() + 3600000,
    });

    console.log("Token créé :", token);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "djabiasko2001@gmail.com",
        pass: "dgsg wqij ctns klja",
      },
    });

    const mailOption = {
      from: "djabiasko2001@gmail.com",
      to: req.body.username,
      subject: "link to reset your password",
      text: `click on this link to reset your password : http://localhost:3000/reset/${token}`,
    };

    console.log("Mail prêt à décoller 🚀");

    transporter.sendMail(mailOption, (err, response) => {
      if (err) {
        console.log("Erreur envoi mail :", err);
        return res.status(500).send("Erreur envoi email");
      } else {
        req.flash("success", "Mail envoyé 📩");
        console.log("Email envoyé :", response.response);
        return res.redirect("/login");
      }
    });
  } catch (error) {
    console.log("Erreur serveur :", error);
    req.flash("error", "Echec d'envoie de Mail 😫");
    res.redirect("/login");
  }
});

// ================= MIDDLEWARE SECURITE =================

// vigile du système
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    req.flash("error", "Connectez vous !Avant ");
    res.redirect("/login");
  }
}

/// ================= ROUTES RECETTES =================

// afficher recettes utilisateur
app.get("/dashboard/myreceipes", isLoggedIn, async (req, res) => {
  try {

    // on récupère toutes les recettes de l'utilisateur connecté
    const receipes = await Receipe.find({ user: req.user.id });

    console.log(receipes);

    if (!receipes || receipes.length === 0) {
      console.log("Aucune recette trouvée");
    }

    // on envoie les recettes à la vue
    res.render("receipe", { receipes });

  } catch (error) {
    console.log(error);
  }
});


// ================= CREATION RECETTE =================

// page formulaire nouvelle recette
app.get("/dashboard/newreceipe", isLoggedIn, (req, res) => {
  res.render("newreceipe");
});


// création recette
app.post("/dashboard/newreceipe", isLoggedIn, async (req, res) => {
  try {

    const newReceipe = {
      name: req.body.name,
      image: req.body.logo,
      user: req.user.id,
    };

    console.log(newReceipe);

    // création dans MongoDB
    await Receipe.create(newReceipe);

    req.flash("success", "New receipe added successfully");

    res.redirect("/dashboard/myreceipes");

  } catch (error) {
    console.log(error);
  }
});


// ================= DETAILS RECETTE =================

app.get("/dashboard/myreceipes/:id", isLoggedIn, async (req, res) => {
  try {

    // on récupère la recette
    const foundReceipeViews = await Receipe.findOne({
      user: req.user.id,
      _id: req.params.id,
    });

    // sécurité si recette inexistante
    if (!foundReceipeViews) {
      console.log("Recette introuvable");
      return res.redirect("/dashboard/myreceipes");
    }

    // on récupère les ingrédients liés à la recette
    const foundIngredients = await Ingredient.find({
      user: req.user.id,
      receipe: req.params.id,
    });

    res.render("ingredients", {
      ingredient: foundIngredients,
      receipe: foundReceipeViews,
    });

  } catch (error) {
    console.log(error);
  }
});


// ================= PAGE AJOUT INGREDIENT =================

app.get("/dashboard/myreceipes/:id/newingredient", isLoggedIn, async (req, res) => {
  try {

    // on récupère la recette pour afficher son nom
    const foundReceipe = await Receipe.findById(req.params.id);

    if (!foundReceipe) {
      console.log("Recette introuvable");
      return res.redirect("/dashboard/myreceipes");
    }

    // on ouvre la page newingredient.ejs
    res.render("newingredient", { receipe: foundReceipe });

  } catch (error) {
    console.log(error);
  }
});


// ================= CREATION INGREDIENT =================

app.post("/dashboard/myreceipes/:id", isLoggedIn, async (req, res) => {
  try {

    // création objet ingrédient
    const newIngredient = {
      name: req.body.name,
      bestDish: req.body.dish,
      user: req.user.id,
      quantite: req.body.quantity,
      receipe: req.params.id,
    };

    console.log(newIngredient);

    // sauvegarde dans MongoDB
    await Ingredient.create(newIngredient);

    req.flash("success", "your ingredient has been added");

    // retour page recette
    res.redirect("/dashboard/myreceipes/" + req.params.id);

  } catch (error) {
    console.log(error);
  }
});


// ================= LANCEMENT SERVEUR =================

// démarrage serveur
app.listen(3000, () => {
  console.log("Serveur connecté : http://localhost:3000");
});

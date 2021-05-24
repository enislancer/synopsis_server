import SeedService from "./seedService";

const sequelize = require("../models");
const faker = require("faker");

const capitalize = s => {
  if (typeof s !== "string") return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
};

const seedController = {
  clean: async () => {
    let response = { status: "ok", message: "Success to truncate DB" };
    try {
      await sequelize.query("SET FOREIGN_KEY_CHECKS = 0");
      await sequelize.sync({ force: true });
      await sequelize.query("SET FOREIGN_KEY_CHECKS = 1");
    } catch (err) {
      response.message = err.message;
      response.status = "error";
    }
    return response;
  },
  seed: async (req, res, next) => {
    try {
      const modelName = capitalize(req.params.model);
      const number = req.params.number;
      console.log(capitalize(modelName));

      if (modelName === "Truncate") {
        sequelize
          .query("SET FOREIGN_KEY_CHECKS = 0")
          .then(function(result) {
            return sequelize.sync({ force: true });
          })
          .then(function() {
            return sequelize.query("SET FOREIGN_KEY_CHECKS = 1");
          })
          .catch(function(err) {
            res.json({ isError: true, status: err.message });
          })
          .finally(() => {
            res.json({ message: "Success to truncate DB" });
          });
        return;
      }

      const model = sequelize.models[modelName];

      if (!model) {
        throw "Invalid model name";
      }

      const data = Array.from(Array(Number(number)), () => {
        switch (modelName) {
          case "Company":
            return {
              createdAt: faker.date.between("2019-01-01", "2020-03-05"),
              url: faker.internet.url(),
              is_enable: faker.random.boolean(),
              email: faker.internet.email(),
              account_type: 1,
              user_info: {
                ip: faker.internet.ip(),
                continent: faker.address.county(),
                country: faker.address.county(),
                city: faker.address.city(),
                lat: faker.address.latitude(),
                lng: faker.address.longitude()
              },

              company_info: {
                lang: "en",
                ranking: faker.random.number({
                  min: 1000,
                  max: 550000
                }),
                logo: `https://i.picsum.photos/id/${Math.floor(
                  Math.random() * 288
                ) + 888}/200/300.jpg`
              }
            };
        }
      });

      model.bulkCreate(data);

      res.json({ modelName, number, data });
    } catch (err) {
      console.log(err);
      res.json({ err });
    }
  },
  fillDB: async (req, res, next) => {
    try {
      const response = await SeedService.cleanAndFeelDB();
      res.json({ response });
    } catch (err) {
      res.json({ err });
    }
  }
};

export default seedController;

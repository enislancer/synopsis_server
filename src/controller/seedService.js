const sequelize = require("../models");
const faker = require("faker");

const SeedService = {
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
  insertModel: async (modelName, count) => {
    const model = sequelize.models[modelName];

    if (!model) {
      throw "Invalid model name";
    }

    const data = Array.from(Array(Number(count)), () => {
      switch (modelName) {
        case "Company":
          return {
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
            },
            createdAt: faker.date.between("2019-01-01", "2020-03-05")
          };
      }
    });

    return await model.bulkCreate(data);
  },
  cleanAndFeelDB: async () => {
    try {
      await sequelize.query("SET FOREIGN_KEY_CHECKS = 0");
      await SeedService.clean();
      // await SeedService.insertModel("Company", 2);
      await sequelize.query("SET FOREIGN_KEY_CHECKS = 1");
      return { success: 1 };
    } catch (err) {
      return { success: 0, err };
    }
  }
};

export default SeedService;

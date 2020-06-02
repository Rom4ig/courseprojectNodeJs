const faker = require('faker');
const tr = require('transliter');
const models = require('./models');

const owner = '5eaaf1f2cc7c2a21bc6e6eb9';

module.exports = () => {
  models.Post.remove()
    .then(() => {
      Array.from({ length: 20 }).forEach(() => {
        const title = faker.lorem.words(5);
        const url = `${tr.slugify(title)}-${Date.now().toString(36)}`;

        models.Post.create({
          title,
          body: faker.lorem.words(100),
          url,
          owner
        })
          .then(console.log)
          .catch(console.log);
      });
    })
    .catch(console.log);
};

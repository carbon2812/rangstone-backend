const prisma = require("../config/prisma");

const createCrudRepository = (modelName) => {
  const model = prisma[modelName];

  return {
    findMany: (args = {}) => model.findMany(args),
    findUnique: (id, args = {}) =>
      model.findUnique({
        where: { id },
        ...args
      }),
    create: (data, args = {}) =>
      model.create({
        data,
        ...args
      }),
    update: (id, data, args = {}) =>
      model.update({
        where: { id },
        data,
        ...args
      }),
    delete: (id) =>
      model.delete({
        where: { id }
      })
  };
};

module.exports = createCrudRepository;

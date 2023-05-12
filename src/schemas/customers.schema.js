import joi from "joi";

export const customerSchema = joi.object({
  name: joi.string().required(),
  phone: joi
    .string()
    .pattern(/^[0-9]{10,11}$/)
    .required(),
  cpf: joi
    .string()
    .length(11)
    .pattern(/^[0-9]+$/)
    .required(),
  birthday: joi.string().isoDate().required(),
});

const { body } = require("express-validator");

const generateImageValidator = [
  body("prompt")
    .notEmpty()
    .withMessage("Prompt is required")
    .isString()
    .withMessage("Prompt must be a string")
    .isLength({ min: 3, max: 1000 })
    .withMessage("Prompt must be between 3 and 1000 characters"),

  body("userId")
    .optional()
    .isMongoId()
    .withMessage("User ID must be a valid MongoDB ID"),

  body("width")
    .optional()
    .isInt({ min: 128, max: 1024 })
    .withMessage("Width must be between 128 and 1024 pixels"),

  body("height")
    .optional()
    .isInt({ min: 128, max: 1024 })
    .withMessage("Height must be between 128 and 1024 pixels"),
];

module.exports = {
  generateImageValidator,
};

// Core Types - Using JSDoc comments for type documentation

/**
 * @typedef {Object} User
 * @property {number} id
 * @property {string} username
 * @property {string} email
 * @property {boolean} isAdmin
 */

/**
 * @typedef {Object} Measurement
 * @property {number} [id]
 * @property {number} userId
 * @property {number} [height]
 * @property {number} [weight]
 * @property {number} [chest]
 * @property {number} [waist]
 * @property {number} [hips]
 * @property {number} [shoulders]
 * @property {number} [neckCircumference]
 * @property {number} [sleeveLength]
 * @property {number} [inseam]
 * @property {number} [thigh]
 * @property {string} [skinColor]
 * @property {string} [description]
 */

/**
 * @typedef {Object} LoginDto
 * @property {string} email
 * @property {string} password
 */

/**
 * @typedef {Object} RegisterDto
 * @property {string} username
 * @property {string} email
 * @property {string} password
 */

/**
 * @typedef {Object} MeasurementDto
 * @property {number} [height]
 * @property {number} [weight]
 * @property {number} [chest]
 * @property {number} [waist]
 * @property {number} [hips]
 * @property {number} [shoulders]
 * @property {number} [neckCircumference]
 * @property {number} [sleeveLength]
 * @property {number} [inseam]
 * @property {number} [thigh]
 * @property {string} [skinColor]
 * @property {string} [description]
 */

/**
 * @typedef {Object} LoginResponse
 * @property {string} username
 * @property {string} token
 */

/**
 * @typedef {Object} UserProfileResponse
 * @property {number} id
 * @property {string} username
 * @property {string} email
 * @property {boolean} isAdmin
 * @property {Measurement} [measurements]
 */

/**
 * @typedef {Object} FormErrors
 * @property {string} [key] - Dynamic keys with string values
 */

/**
 * @typedef {Object} ApiError
 * @property {string} error
 * @property {string} [details]
 */

export {}; // Make this a module
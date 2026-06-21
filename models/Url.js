import mongoose from 'mongoose';

const urlSchema = new mongoose.Schema({
  originalUrl: {
    type: String,
    required: [true, 'Original URL is required'],
    trim: true,
    validate: {
      validator: function(v) {
        try {
          // Attempt to parse URL. Must include protocol (http/https).
          const url = new URL(v);
          return url.protocol === 'http:' || url.protocol === 'https:';
        } catch (err) {
          return false;
        }
      },
      message: props => `${props.value} is not a valid HTTP/HTTPS URL!`
    }
  },
  shortCode: {
    type: String,
    required: [true, 'Short code is required'],
    unique: true,
    trim: true,
    index: true
  },
  clicks: {
    type: Number,
    required: true,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Url = mongoose.model('Url', urlSchema);

export default Url;

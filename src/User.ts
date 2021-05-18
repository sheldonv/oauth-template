import mongoose from 'mongoose';

const user = new mongoose.Schema({
    googleId: {
        type: String,
        required: false
    },
    twitterId: {
        type: String,
        required: false
    },
    githubId: {
        type: String,
        required: false
    },
    username: {
        type: String,
        required: false
    },
    imageUrl: {
        type: String,
        required: false
    }
})

export default mongoose.model('User', user)
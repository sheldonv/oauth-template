export interface IUser {
    googleId?: string,
    twitterId?: string,
    githubId?: string,
    username: string,
    imageUrl: string
}

export interface IMongoDBUser{
    googleId?: string,
    twitterId?: string,
    githubId?: string,
    username: string,
    imageUrl: string,
    __v: number,
    _id: string
}


export class SomeService {
    getUser(){
        return {
            id: 1,
            username: 'john doe'
        }
    }

    getUserWithError(){
        throw Error('User not found')
    }

}
import auth from '../app/auth/routes'
import main from '../app/main/routes'
import posts from '../app/posts/routes'
import profiles from '../app/profiles/routes'

export default [
    ...auth,
    ...main,
    ...posts,
    ...profiles
]
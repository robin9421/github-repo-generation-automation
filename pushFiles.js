const Octokit = require('@octokit/rest')
const octokit = new Octokit({
    auth : 'token bfe9363369015a52445c51a1f11ce532ecff87f4'
})

// octokit.repos.createForAuthenticatedUser({
//     name : 'Hello-robin',
//     // description : 'welcome to the Github',
//     // is_template : 'No'
// })

octokit.repos.createOrUpdateFile({
    owner:'robin9421',
    repo:'test',
    path:'firstDirectory2',
    message:'hello robin!!',
    content:''
  })
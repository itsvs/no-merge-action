import * as core from '@actions/core'
const {GitHub, context} = require('@actions/github')
const parse = require('parse-diff')

async function run() {
  try {
    const token = core.getInput('github-token', {required: true})
    const github = new GitHub(token, {})
    const keyword = core.getInput('keyword')

    const diff_url = context.payload.pull_request.diff_url
    const result = await github.request(diff_url)
    const files = parse(result.data)
    core.exportVariable('files', files)
    core.setOutput('files', files)

    let changes = ''
    for (const file of files) {
      for (const chunk of file.chunks) {
        for (const change of chunk.changes) {
          if (change.add) {
            changes += change.content
          }
        }
      }
    }

    if (changes.indexOf(keyword) >= 0) {
      core.setFailed(`The code contains ${keyword}`)
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()

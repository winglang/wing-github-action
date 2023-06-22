import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as path from 'path'

export const runCommand = async (
  command: string,
  args: string[],
  options?: exec.ExecOptions
): Promise<{output: string; error: string}> => {
  let output = ''
  let error = ''

  await exec.exec(command, args, {
    ...options,
    listeners: {
      stdout: (data: Buffer) => {
        output += data.toString()
      },
      stderr: (data: Buffer) => {
        error += data.toString()
      }
    }
  })

  core.debug(`stdout: ${output}`)
  core.debug(`stderr: ${error}`)

  return {
    output,
    error
  }
}

export const stateFile = (refName = process.env.GITHUB_BASE_REF): string => {
  const cwd: string = core.getInput('working-directory')
  const backendScope: string = core.getInput('backend-scope')
  const repo = process.env.GITHUB_REPOSITORY
  const fileName = 'terraform.tfstate'
  if (repo === undefined) {
    throw new Error('GITHUB_REPOSITORY is undefined')
  }
  if (refName === undefined) {
    throw new Error('GITHUB_REF_NAME is undefined')
  }
  let key: string
  if (backendScope !== '') {
    key = path.join(repo, refName, backendScope, fileName)
  } else if (cwd !== '') {
    key = path.join(repo, refName, cwd, fileName)
  } else {
    key = path.join(repo, refName, fileName)
  }
  core.info(`Using S3 key: ${key}`)
  return key
}

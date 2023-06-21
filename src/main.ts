import * as core from '@actions/core'
import * as path from 'path'
import * as fs from 'fs'

import {runCommand, stateFile} from './utils'

async function run(): Promise<void> {
  try {
    const entrypoint: string = core.getInput('entry')
    const version: string = core.getInput('version')
    const target: string = core.getInput('target')
    const backend: string = core.getInput('backend')
    const cwd: string = core.getInput('working-directory')

    if (version === '') {
      throw new Error('version is required')
    }

    if (target === '') {
      throw new Error('target is required')
    }

    if (backend === '') {
      throw new Error('backend is required')
    }

    if (entrypoint === '') {
      throw new Error('entry is required')
    }

    if (cwd !== '') {
      core.info(`Changing directory to ${cwd}`)
      process.chdir(path.join(process.cwd(), cwd))
    }

    const main = path.basename(entrypoint, '.w')
    const workdir = path.dirname(entrypoint)

    // debug is only output if you set the secret `ACTIONS_STEP_DEBUG` to true
    core.debug(`Using ${entrypoint} ...`)

    await runCommand('npm', ['install', '-g', `winglang@${version}`])
    core.info(`Installed winglang@${version}`)

    // if package.json exists, install dependencies
    if (fs.existsSync(path.join(process.cwd(), 'package.json'))) {
      await runCommand('npm', ['ci'])
      core.info(`Installed NPM dependencies with npm ci`)
    } else {
      core.info(`No package.json found, skipping npm ci`)
    }

    const tfEnv: Record<string, string> = {
      ...process.env,
      TF_IN_AUTOMATION: 'true'
    }

    if (backend === 's3') {
      core.info(`Injecting backend config for S3`)

      await runCommand('wing', ['compile', '-t', target, entrypoint], {
        env: {
          ...tfEnv,
          TF_BACKEND_STATE_FILE: stateFile()
        }
      })
    } else {
      await runCommand('wing', ['compile', '--debug', '-t', target, entrypoint])
    }

    const tfWorkDir = path.join(
      process.cwd(),
      workdir,
      'target',
      `${main}.${target.replace('-', '')}`
    )
    await runCommand('terraform', ['init'], {
      cwd: tfWorkDir,
      env: tfEnv
    })

    await runCommand('terraform', ['apply', '-input=false', '-auto-approve'], {
      cwd: tfWorkDir,
      env: tfEnv
    })
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()

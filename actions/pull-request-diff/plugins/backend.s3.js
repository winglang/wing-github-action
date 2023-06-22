// mostly copied from here https://github.com/winglang/wing/blob/92a5c8d51f24ef6bd988c3a569ad87d1c071a3eb/examples/plugins/tf-backend.js
/**
 *    - TF_BACKEND_BUCKET - The name of the s3 bucket to use for storing Terraform state
 *    - TF_BACKEND_BUCKET_REGION - The region the bucket was deployed to
 * Optional Env Variables:
 * STATE_FILE - The object key used to store state file (default: wing-tf.tfstate)
 */

exports.postSynth = function(config) {
  if (!process.env.TF_BACKEND_BUCKET) {throw new Error("env var TF_BACKEND_BUCKET not set")}
  if (!process.env.TF_BACKEND_BUCKET_REGION) {throw new Error("env var TF_BACKEND_BUCKET_REGION not set")}
  if (!process.env.TF_BACKEND_STATE_FILE) {throw new Error("env var TF_BACKEND_STATE_FILE not set")}
  config.terraform.backend = {
    s3: {
      bucket: process.env.TF_BACKEND_BUCKET,
      region: process.env.TF_BACKEND_BUCKET_REGION,
      key: process.env.TF_BACKEND_STATE_FILE
    }
  }
  return config;
}
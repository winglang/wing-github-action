bring cloud;
bring "cdktf" as cdktf;

let output = new cdktf.TerraformOutput(
  value: "Hello, world!",
);
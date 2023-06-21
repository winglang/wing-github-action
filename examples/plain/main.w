bring cloud;
bring util;

let bucket = new cloud.Bucket();
let queue = new cloud.Queue();

queue.setConsumer(inflight (message: str) => {
  bucket.put("wing.txt", "Hello, ${message}");
}, timeout: 1s);

// tests
test "Hello, world!" {
  queue.push("world!");
  util.sleep(1s);
  assert("Hello, world!" == bucket.get("wing.txt"));
}
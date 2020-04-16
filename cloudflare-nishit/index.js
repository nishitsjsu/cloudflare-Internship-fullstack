addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})
/**
 * Respond with hello worker text
 * @param {Request} request
 */
async function handleRequest(request) {

  const url = 'https://cfw-takehome.developers.workers.dev/api/variants'

  let response = await fetch(url)

  if(response.ok) {
    console.log("Response")
    let payload = await response.json()
    console.log(payload.variants[0], payload.variants[1])
  }

  return new Response('Response from the provided URL!', {
    headers: { 'content-type': 'text/plain' },
  })
}
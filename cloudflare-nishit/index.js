
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function getVariantURLs(url){
  let getVariantURLs = await fetch(url)

  if(!getVariantURLs) {
    return new Response("Fetch variant urls failed")
  } else {
    return getVariantURLs
  }
}

async function changeVariant(oldVariant) {
  let newVariant = new HTMLRewriter()
    .on('h1#title', {
      element(element) {
        element.setInnerContent(`Nishit's Variant`)
      },
    })
    .on('title', {
      element(element) {
        element.setInnerContent(`Nishit's Variant`)
      }
    })
    .on('p#description', {
      element(element) {
        element.setInnerContent(`Please click below to have a look at my Linkedin profile`)
      }
    })
    .on('a', {
      element(element) {
        element.setAttribute("href", "https://linkedin.com/in/nishit--doshi")
        element.setInnerContent(`My Linkedin profile`)
      }
    })
    .transform(oldVariant)
    
  return newVariant
}


/**
 * Respond with hello worker text
 * @param {Request} request
 */
async function handleRequest(request) {
  const url = 'https://cfw-takehome.developers.workers.dev/api/variants'
  let variantURLs, cookieHeader = {}
  let initialVariantURLs = await getVariantURLs(url)

  if(initialVariantURLs.ok) { 
    variantURLs = await initialVariantURLs.json()
  }
  
  if(request.headers.get('Cookie')){
    request.headers.get('Cookie').split(';').forEach(element => {
      let [key,value] = element.split('=')
      cookieHeader[key.trim()] = value
    })
  }

  let currentIndexUrl = (cookieHeader["visitedURL"]) ? cookieHeader["visitedURL"] : Math.floor(Math.random() * 2)
  let currentUrl = await variantURLs.variants[currentIndexUrl]
  let response = await fetch(currentUrl) 

  if(response.ok){
    let body = response.body

    let originalResponse = new Response(body, {
      headers: { 'Set-Cookie': `visitedURL = ${currentIndexUrl}` },
    })
  
    return changeVariant(originalResponse)

  } else {
    return new Response("Error in fetching response from variant URL.", {status:500})
  }
}
/* 
  index.js 
  Author: Nishit Doshi
  Last Modified: April 16th 2020 
*/
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

/**
 * Respond the list of initial URLs
 * @param url
 */
async function getVariantURLs(url){
  let getVariantURLs = await fetch(url)

  if(!getVariantURLs) {
    return new Response("Fetch variant urls failed")
  } else {
    return getVariantURLs
  }
}

/**
 * Respond with updated HTML Rewriter
 * @param oldVariant
 * @returns newVariant
 */
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
 * Respond with variant URL in A/B Testing Style
 * @param {Request} request
 * @returns {Response} customised variant
 */
async function handleRequest(request) {
  const url = 'https://cfw-takehome.developers.workers.dev/api/variants'
  let variantURLs, cookieHeader = {}
  let initialVariantURLs = await getVariantURLs(url)

  if(initialVariantURLs.ok) { 
    variantURLs = await initialVariantURLs.json()
  }

  /* Get last URL index displayed to user from the cookie values */
  if(request.headers.get('Cookie')){
    request.headers.get('Cookie').split(';').forEach(element => {
      let [key,value] = element.split('=')
      cookieHeader[key.trim()] = value
    })
  }

  /* Assignment of url : based on cookie value or A/B testing style */
  let currentIndexUrl = (cookieHeader["visitedURL"]) ? cookieHeader["visitedURL"] : Math.floor(Math.random() * 2)
  let currentUrl = await variantURLs.variants[currentIndexUrl]
  let response = await fetch(currentUrl) 

  if(response.ok){
    let body = response.body

    let originalResponse = new Response(body, {
      headers: { 'Set-Cookie': `visitedURL = ${currentIndexUrl}` },
    })
    
    /* to transform original response to customized response */
    return changeVariant(originalResponse)

  } else {
    /* Error handling : internal server error */
    return new Response("Error in fetching response from variant URL.", {status:500})
  }
}
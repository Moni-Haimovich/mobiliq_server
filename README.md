# mobiliq_server
## Property REST APIs
  ### create property
    * header
        ```
        Method: POST
        Content-Type: multipart/form-data
        ```
    * body
        ```
        * body should be FormData.
        * length of images array and images_meta array should be same.
        ```
        ```
        {
            "name": {
                type: string
                required: true
            }
            "description": {
                type: string
                required: true
            }
            "address": {
                type: string
                required: true
            }
            "lat": {
                type: number
                required: true
            }
            "lng": {
                type: number
                required: true
            }
            "images" {
                type: array of image files
                required: true,
            }
            "images_meta": {
                type: array of image meta-data
                required: true
            }
        }
        ```

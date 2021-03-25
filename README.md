# mobiliq_server

**Author: Mauro G<letalwarframe@gmail.com>**

## V0

### Get all properties

- header

  ```
  Method: GET
  Content-Type: application/json
  ```

### Find properties by name

- header

  ```
  Method: GET
  Content-Type: application/json
  ```

- body

```
query params
  {
    name: <here goes the name of property>
  }
```

### Create property

- header

  ```
  Method: POST
  Content-Type: multipart/form-data
  ```

- body

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

### Add images to property

- header

  ```
  Method: PUT
  Content-Type: multipart/form-data
  ```

- body

  ```
  * body should be FormData.
  * length of images array and images_meta array should be same.
  ```

  ```
  {
      "_id": {
          type: ObjectID
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

## V1

### Remove image from property

- header

  ```
  Method: PUT
  Content-Type: application/json
  ```

- body

  ```
  {
      propertyId: <_id of target property>
      imageId: <_id of target image in property>
  }
  ```

### Delete property

- header

  ```
  Method: DELETE
  Content-Type: application/json
  ```

- body

  ```
  request param {
      id: <_id of target property>
  }
  ```

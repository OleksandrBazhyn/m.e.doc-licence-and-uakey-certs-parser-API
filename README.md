# M.E.Doc licence and uakey QES tracker API
This is a parser of information about the expiration date of the M.E.Doc software license and the expiration date of the electronic signature from the Key Certification Center "Ukraine".

This repository containes the server side of the project. It sends a response to the client in JSON format.

Search on:
- https://medoc.ua/
- https://uakey.com.ua/
## Build
Clone repository and install dependencies:
```bash
npm install
```
To run the project, execute the following command:
```bash
npm run start
```
## Features & Uses
This repository allows you to easily parse the information needed to track the status of electronic signatures and licenses of the M.E.Doc program in the absence of a direct API.

There is a way to get data on two resources in JSON format via the path /api/search/:usreou

To get only information about electronic signatures: /api/uakey/:usreou

To get only information about the M.E.Doc license: /api/medoc/:usreou


This data can already be processed further. An example of the client part is also available in the repository.

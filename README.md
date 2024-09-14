## Usage

### Start the app

```
deno task start
```

This command will start the Deno server and serve the web application.

### Clean the data

1. Convert PDF to text:
   ```
   pdftotext -layout saoke.pdf
   ```

2. Clean the data:
   ```
   deno run -A clean-data.js
   ```

This process uses regular expressions to extract and format the necessary data from the PDF text.

## Demo

![saoke](demo.png "Demo")

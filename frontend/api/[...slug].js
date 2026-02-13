export default function handler(req, res) {
  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="0;url=/">
  <script>
    sessionStorage.setItem('redirect_path', window.location.pathname);
    window.location.href = '/';
  </script>
</head>
<body>Redirecting...</body>
</html>
  `);
}

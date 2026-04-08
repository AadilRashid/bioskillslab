<?php
session_start();
define('ADMIN_PASSWORD', 'kasouq@54321');

if (isset($_POST['password'])) {
  if ($_POST['password'] === ADMIN_PASSWORD) {
    $_SESSION['admin'] = true;
  } else {
    $error = 'Wrong password.';
  }
}

if (isset($_GET['logout'])) {
  session_destroy();
  header('Location: admin.php');
  exit;
}

if (isset($_GET['delete']) && isset($_SESSION['admin'])) {
  require 'config.php';
  $db = getDB();
  $stmt = $db->prepare('DELETE FROM comments WHERE id = ?');
  $stmt->execute([(int)$_GET['delete']]);
  header('Location: admin.php');
  exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>BioSkills Lab — Admin</title>
  <style>
    body { font-family: sans-serif; background: #0f172a; color: #e2e8f0; padding: 2rem; }
    h1 { color: #38bdf8; margin-bottom: 1.5rem; }
    .login { max-width: 320px; margin: 4rem auto; background: #1e293b; padding: 2rem; border-radius: 12px; }
    input[type=password] { width: 100%; padding: .65rem 1rem; background: #0f172a; border: 1px solid #334155; border-radius: 8px; color: #e2e8f0; font-size: 1rem; box-sizing: border-box; margin-bottom: 1rem; }
    button { padding: .65rem 1.5rem; background: #38bdf8; color: #0f172a; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; }
    .error { color: #f87171; margin-bottom: 1rem; font-size: .9rem; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: .75rem 1rem; text-align: left; border-bottom: 1px solid #1e293b; font-size: .85rem; }
    th { background: #1e293b; color: #94a3b8; }
    tr:hover { background: #1e293b; }
    .badge { display: inline-block; padding: .2rem .6rem; background: #0ea5e9; color: #0f172a; border-radius: 20px; font-size: .75rem; font-weight: 600; }
    .del { color: #f87171; text-decoration: none; font-weight: 600; }
    .del:hover { text-decoration: underline; }
    .logout { float: right; font-size: .85rem; color: #94a3b8; text-decoration: none; }
    .logout:hover { color: #f87171; }
    .stats { display: flex; gap: 2rem; margin-bottom: 2rem; }
    .stat { background: #1e293b; padding: 1rem 1.5rem; border-radius: 10px; }
    .stat span { display: block; font-size: 1.5rem; font-weight: 800; color: #38bdf8; }
    .stat small { color: #94a3b8; font-size: .8rem; }
  </style>
</head>
<body>
<?php if (!isset($_SESSION['admin'])): ?>
  <div class="login">
    <h1>Admin Login</h1>
    <?php if (isset($error)) echo "<div class='error'>$error</div>"; ?>
    <form method="POST">
      <input type="password" name="password" placeholder="Password" autofocus>
      <button type="submit">Login</button>
    </form>
  </div>
<?php else: ?>
  <?php
    require 'config.php';
    $db = getDB();
    $total = $db->query('SELECT COUNT(*) FROM comments')->fetchColumn();
    $chapters = $db->query('SELECT COUNT(DISTINCT chapter) FROM comments')->fetchColumn();
    $recent = $db->query('SELECT COUNT(*) FROM comments WHERE created_at > DATE_SUB(NOW(), INTERVAL 7 DAY)')->fetchColumn();
    $comments = $db->query('SELECT id, chapter, name, email, text, created_at FROM comments ORDER BY created_at DESC')->fetchAll(PDO::FETCH_ASSOC);
  ?>
  <h1>BioSkills Lab — Comments Admin <a href="?logout" class="logout">Logout</a></h1>
  <div class="stats">
    <div class="stat"><span><?= $total ?></span><small>Total Comments</small></div>
    <div class="stat"><span><?= $chapters ?></span><small>Chapters with Comments</small></div>
    <div class="stat"><span><?= $recent ?></span><small>Last 7 Days</small></div>
  </div>
  <table>
    <thead><tr><th>Chapter</th><th>Name</th><th>Email</th><th>Comment</th><th>Date</th><th>Action</th></tr></thead>
    <tbody>
    <?php foreach ($comments as $c): ?>
      <tr>
        <td><span class="badge"><?= htmlspecialchars($c['chapter']) ?></span></td>
        <td><?= htmlspecialchars($c['name']) ?></td>
        <td><?= htmlspecialchars($c['email'] ?: '—') ?></td>
        <td><?= htmlspecialchars(mb_substr($c['text'], 0, 100)) ?><?= strlen($c['text']) > 100 ? '...' : '' ?></td>
        <td><?= $c['created_at'] ?></td>
        <td><a href="?delete=<?= $c['id'] ?>" class="del" onclick="return confirm('Delete this comment?')">Delete</a></td>
      </tr>
    <?php endforeach; ?>
    </tbody>
  </table>
<?php endif; ?>
</body>
</html>

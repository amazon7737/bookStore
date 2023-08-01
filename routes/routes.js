const express = require("express");
const router = express.Router();
const pool = require("../db/db");
/**
 *  해야할것:
 *
 *  - 중복 회원 조회 기능
 *  - 로그인 세션 기능
 *
 *
 */

// 로그인 페이지
router.get("/signin", async (req, res) => {
  res.render("signin");
});

// 로그인 기능
router.post("/signin", async (req, res) => {
  const { user_id, password } = req.body;
  //   console.log("user_id:", user_id, "password:", password);

  try {
    const login = await pool.query(
      "select * from book.user where user_id = ? and password = ?",
      [user_id, password]
    );
    req.session.user_id = user_id;
    console.log(req.session.user_id);
    return res.redirect("/main");
  } catch (error) {
    console.log(error);
    res.send(
      `<script type="text/javascript">
        alert("아이디 또는 비밀번호가 올바르지 않습니다."); 
        location.href='./signin';
        </script>`
    );
  }
});

// 로그아웃 기능
router.get("/logout", async (req, res) => {
  try {
    req.session.destroy(function () {
      req.session;
    });
    return res.send(
      `<script type = "text/javascript" >alert("로그아웃되었습니다.");location.href='/main';</script>`
    );
  } catch (error) {
    console.log(error);
  }
});

// 회원가입 페이지
router.get("/signup", async (req, res) => {
  res.render("signup");
});

// 회원가입 기능
router.post("/signup", async (req, res) => {
  const { user_id, password, user_name } = req.body;
  console.log(user_id, password, user_name);
  try {
    const users = await pool.query("insert into book.user values(?, ?, ?)", [
      user_id,
      password,
      user_name,
    ]);
    console.log("user_id:", user_id);
    return res.redirect("/");
  } catch (error) {
    console.log(error);
  }
});

// 로그아웃 기능

// 책 리스트 조회
// router.get("/bookList", async (req, res) => {
//   // const book = await pool.query("select * from book.book_list;");
//   // console.log(book[0]);
//   res.render("booklist", { book: book[0] });
// });

// 카드 추가 페이지
router.get("/addCard", async (req, res) => {
  res.render("addCard");
});

// 배송지 주소 추가 페이지
router.get("/parCel", async (req, res) => {
  res.render("addParcel");
});

// 마이페이지

// 도서 상세 페이지
router.get("/:book_number", async (req, res) => {
  // console.log(req.params);
  const { book_number } = req.params;
  const book = await pool.query(
    "SELECT * FROM book.book_list where book_number = ?;",
    [book_number]
  );
  // console.log(book[0]);
  try {
    res.render("bookDetail", { book: book[0] });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;

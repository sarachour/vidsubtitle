package api;

import (
   "database/sql"
    _ "github.com/mattn/go-sqlite3"
   "net/http"
   "code.google.com/p/gorest"
   "fmt"
)

type Api struct {
   db *sql.DB
   iface *ApiInterface
}

/* API Structurs */
type ApiCaptionResponse struct {
   Kind string `json:"kind"`
   Captions string `json:"captions"`
}
type ApiRequestInfo struct {

}
type ApiCommitInfo struct {
   Kind string `json:"kind"` //kind of work completed
   Data string `json:"data"` //data completed
   Captions string `json:"captions"` //data completed
}
type ApiGetWorkResponse struct{
   Kind string `json:"kind"`
   Data string `json:"data"`
}
type ApiInterface struct {
   gorest.RestService `root:"/api/" consumes:"application/json" produces:"application/json"`
   getCaptions gorest.EndPoint `method:"GET" path:"/view/get/{uid:string}/{vid:string}" output:"ApiCaptionResponse"`
   requestVideo gorest.EndPoint `method:"POST" path:"/view/request/{uid:string}/{vid:string}" postdata:"ApiRequestInfo"`
   commitWork gorest.EndPoint `method:"POST" path:"/work/commit/{uid:string}/{vid:string}" postdata:"ApiCommitInfo"`
   getWork gorest.EndPoint `method:"GET" path:"/work/get/{uid:string}/{vid:string}/{work_type:string}" output:"ApiGetWorkResponse"`
   api_handle *Api
}

type DBTurker struct {
   id sql.NullInt64
}
type DBUser struct {
   id sql.NullInt64
}
type DBRequest struct {
   user_id sql.NullInt64
   video_id sql.NullInt64
}

//turker id, video id 
type DBWork struct {
   turker_id sql.NullInt64
   video_id sql.NullInt64
   stage sql.NullString   
}

type DBVideo struct {
   id sql.NullInt64 //the id of the video
   code sql.NullString
   stage sql.NullString //the stage of the video
   data sql.NullString
   captions sql.NullString
}

func report(msg string){
   fmt.Println("# [LOG][API] "+msg);
}


func(serv ApiInterface) RequestVideo(i ApiRequestInfo, uid string, vid string) {
   var db := serv.api_handle.db;
   report("request video"); //user i requests video with code j
   //if rows,err = db.Query("")
   
} 
func(serv ApiInterface) GetCaptions(uid string, vid string) (ApiCaptionResponse){
   var c ApiCaptionResponse;
   c.Kind = "raw";
   c.Captions = "FOOBAR";
   return c;
   //serv.ResponseBuilder().SetResponseCode(404).Overide(true)  
}
func(serv ApiInterface) CommitWork(i ApiCommitInfo, uid string, vid string) {
   report("commit work");
   
} 
func(serv ApiInterface) GetWork(uid string, vid string, kind string) (ApiGetWorkResponse) {
   var r ApiGetWorkResponse;
   r.Kind  = "segment";
   r.Data = "FOOBAR";

   report("get work");
   return r;
}

/*
Sets up the database.
*/
func setupDB() *sql.DB{
   db, err := sql.Open("sqlite3", "./db/hs.db");
   if err != nil {
      panic(err);
   }
   //test if db is alive
   if err := db.Ping(); err != nil {panic(err);}
   if _, err := db.Begin(); err != nil {panic(err);}

   if _, err := db.Exec(`
         CREATE TABLE IF NOT EXISTS Users 
         ( 
            id INTEGER PRIMARY KEY 
         )`); err != nil {panic(err);}

   if _, err := db.Exec(`
         CREATE TABLE IF NOT EXISTS Turkers 
         ( 
            id INTEGER PRIMARY KEY 
         )`); err != nil {panic(err);}

   if _, err := db.Exec(`PRAGMA foreign_keys = ON;`); err != nil {panic(err);}


   if _, err := db.Exec(`
         CREATE TABLE IF NOT EXISTS Videos 
         ( 
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code STRING,
            stage STRING,
            data STRING,
            captions STRING
         );`); err != nil {panic(err);}

   if _, err := db.Exec(`
         CREATE TABLE IF NOT EXISTS Requests 
         ( 
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            video_id INTEGER,
            FOREIGN KEY(user_id) REFERENCES Users(id) ON UPDATE CASCADE,
            FOREIGN KEY(video_id) REFERENCES Videos(id) ON UPDATE CASCADE
         );`); err != nil {panic(err);}

   if _, err := db.Exec(`
         CREATE TABLE IF NOT EXISTS Work 
         ( 
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            stage string, 
            turker_id INTEGER,
            video_id INTEGER,
            FOREIGN KEY(turker_id) REFERENCES Turkers(id) ON UPDATE CASCADE,
            FOREIGN KEY(video_id) REFERENCES Videos(id) ON UPDATE CASCADE
         );`); err != nil {panic(err);}


   return db;
}
func SetupAPI(prefix string) Api {
   var a Api;
   
   a.db = setupDB();
   a.iface = new(ApiInterface);
   a.iface.api_handle = &a;
   gorest.RegisterService(a.iface);
   gorest.RegisterMarshaller("application/json", gorest.NewJSONMarshaller())
   http.Handle(prefix, gorest.Handle());
   return a;
}





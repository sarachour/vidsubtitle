package api;

import (
   "database/sql"
    _ "github.com/mattn/go-sqlite3"
   "net/http"
   "code.google.com/p/gorest"
   "fmt"
   "encoding/json"
)

type Api struct {
   db *sql.DB
   iface *ApiInterface
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
/* API Structurs */
type ApiCaptionResponse struct {
   Kind string `json:"kind"`
   Captions string `json:"captions"`
}
type StatusResponse struct {
   Message string `json:"msg"`
}
type ListVideoResponse struct{
   Data string `json:"data"`
   Id string `json:"id"`
   Captions string `json:"captions"`
   Stage string `json:"stage"`
}
type ListUserResponse struct{
   Id string `json:"id"`
}
type ListTurkerResponse struct{
   Id string `json:"id"`
}
type ListRequestResponse struct{
   UserId string `json:"user_id"`
   VideoId string `json:"video_id"`
}
type ListWorkResponse struct{
   TurkerId string `json:"turker_id"`
   VideoId string `json:"video_id"`
   Stage string `json:"stage"`
}
type ApiInterface struct {
   gorest.RestService `root:"/api/" consumes:"application/json" produces:"application/json"`
   registerUser gorest.EndPoint `method:"POST" path:"/register/user/{uid:string}" postdata:"string"`
   registerTurker gorest.EndPoint `method:"POST" path:"/register/turker/{uid:string}" postdata:"string"`

   listVideos gorest.EndPoint `method:"GET" path:"/view/list/videos" output:"[]ListVideoResponse"`
   listUsers gorest.EndPoint `method:"GET" path:"/view/list/users" output:"[]ListUserResponse"`
   listTurkers gorest.EndPoint `method:"GET" path:"/view/list/turker" output:"[]ListTurkerResponse"`
   listRequests gorest.EndPoint `method:"GET" path:"/view/list/requests" output:"[]ListRequestResponse"`
   listWork gorest.EndPoint `method:"GET" path:"/view/list/work" output:"[]ListWorkResponse"`
   
   getCaptions gorest.EndPoint `method:"GET" path:"/view/get/{uid:string}/{vid:string}" output:"ApiCaptionResponse"`
   requestVideo gorest.EndPoint `method:"POST" path:"/view/request/{uid:string}/{vid:string}" postdata:"ApiRequestInfo"`
   commitWork gorest.EndPoint `method:"POST" path:"/work/commit/{uid:string}/{vid:string}" postdata:"ApiCommitInfo"`
   getWork gorest.EndPoint `method:"GET" path:"/work/get/{uid:string}/{vid:string}/{work_type:string}" output:"ApiGetWorkResponse"`
   api_handle *Api
}

type DBTurker struct {
   id sql.NullString
}
type DBUser struct {
   id sql.NullString
}
type DBRequest struct {
   user_id sql.NullString
   video_id sql.NullString
}

//turker id, video id 
type DBWork struct {
   turker_id sql.NullString
   video_id sql.NullString
   stage sql.NullString   
}

type DBVideo struct {
   id sql.NullString //the id of the video
   stage sql.NullString //the stage of the video
   data sql.NullString
   captions sql.NullString
}

var api_handle *Api;
func report(msg string){
   fmt.Println("# [LOG][API] "+msg);
}

func rslv_nstr(s sql.NullString) string{
   if s.Valid {return s.String;}
   return "null";
}
func snd_post_resp(serv *ApiInterface, data interface{}){
   rb := serv.ResponseBuilder()
   rb.AddHeader("Content-Type", "application/json")
   str,err := json.Marshal(data);
   if err != nil {panic(err)}
   rb.Write([]byte(str))
}
func(serv ApiInterface) ListVideos() ([]ListVideoResponse){
   l := make([]ListVideoResponse,0);

   var db = api_handle.db;
   rows,err := db.Query("select * from Videos");
   if err != nil {panic(err)}
   defer rows.Close();
   for rows.Next(){
      var vr DBVideo;
      var elem ListVideoResponse;
      if err := rows.Scan(&vr.id, &vr.stage, &vr.data, &vr.captions); err != nil { panic(err);}
      elem.Id = rslv_nstr(vr.id);
      elem.Stage = rslv_nstr(vr.stage);
      elem.Data = rslv_nstr(vr.data);
      elem.Captions = rslv_nstr(vr.captions);
      l = append(l,elem);
   }
   return l;
}

func(serv ApiInterface) ListUsers() ([]ListUserResponse){
   l := make([]ListUserResponse,0);
   var db = api_handle.db;
   rows,err := db.Query("select * from Users");
   if err != nil {panic(err)}
   defer rows.Close();
   for rows.Next(){
      var vr DBUser;
      var elem ListUserResponse;
      if err := rows.Scan(&vr.id); err != nil { panic(err);}
      elem.Id = rslv_nstr(vr.id);
      l = append(l,elem);
   } 
   return l;
}

func(serv ApiInterface) ListTurkers() ([]ListTurkerResponse){
   l := make([]ListTurkerResponse,0);
   var db = api_handle.db;
   rows,err := db.Query("select * from Turkers");
   if err != nil {panic(err)}
   defer rows.Close();
   for rows.Next(){
      var vr DBTurker;
      var elem ListTurkerResponse;
      if err := rows.Scan(&vr.id); err != nil { panic(err);}
      elem.Id = rslv_nstr(vr.id);
      l = append(l,elem);
   } 
   return l;
}


func(serv ApiInterface) ListRequests() ([]ListRequestResponse){
   l := make([]ListRequestResponse,0);
   var db = api_handle.db;
   rows,err := db.Query("select video_id, user_id from Requests");
   if err != nil {panic(err)}
   defer rows.Close();
   for rows.Next(){
      var vr DBRequest;
      var elem ListRequestResponse;
      if err := rows.Scan(&vr.video_id, &vr.user_id); err != nil { panic(err);}
      elem.VideoId = rslv_nstr(vr.video_id);
      elem.UserId = rslv_nstr(vr.user_id);
      l = append(l,elem);
   } 
   return l;
}

func(serv ApiInterface) ListWork() ([]ListWorkResponse){
   l := make([]ListWorkResponse,0);
   var db = api_handle.db;
   rows,err := db.Query("select (video_id, turker_id, stage) from Work");
   if err != nil {panic(err)}
   defer rows.Close();
   for rows.Next(){
      var vr DBWork;
      var elem ListWorkResponse;
      if err := rows.Scan(&vr.video_id, &vr.turker_id, &vr.stage); err != nil { panic(err);}
      elem.VideoId = rslv_nstr(vr.video_id);
      elem.TurkerId = rslv_nstr(vr.turker_id);
      elem.Stage = rslv_nstr(vr.stage);
      l = append(l,elem);
   }
   return l;
}

func(serv ApiInterface) RequestVideo(i ApiRequestInfo, uid string, vid string) {
   var db = api_handle.db;
   var resp StatusResponse;
   //find the video.
   rows,err := db.Query("select * from Videos where id = ?",vid)
   if err != nil {panic(err)}
   defer rows.Close();

   //test if this request already exists

   defer rows.Close();
   if !rows.Next(){
      resp.Message = "first time request. inserting video request into database.";
      if _,err := db.Exec("INSERT INTO Videos(id, stage) values(?,?);", vid, "pending"); err != nil {panic(err)}
   } else {
      resp.Message = "logging user request for video.";
   }
   //insert request 
   db.Exec("INSERT INTO Requests(user_id, video_id) values(?,?);", uid,vid);
   
   
   snd_post_resp(&serv,resp);
} 
func(serv ApiInterface) RegisterUser(i string, uid string){
   var db = api_handle.db;
   var ur DBUser;
   var resp StatusResponse;
   //find the video.
   rows,err := db.Query("select * from Users where id = ?",uid)
   if err != nil {panic(err)}
   //test if this request already exists

   defer rows.Close();
   if !rows.Next(){
      report("Inserting user: "+ uid + "/" + ur.id.String);
      resp.Message = "successfully inserted user";
      if _,err := db.Exec("INSERT INTO Users(id) values(?);", uid); err != nil {panic(err)}
   } else {
      resp.Message = "user already exists";
   }
   
   snd_post_resp(&serv,resp);

   //serv.ResponseBuilder().SetResponseCode(404).Overide(true)  
}
func(serv ApiInterface) RegisterTurker(i string, tid string){
   var db = api_handle.db;
   var ur DBTurker;
   var resp StatusResponse;
   //find the video.
   rows,err := db.Query("select * from Users where id = ?",tid)
   if err != nil {panic(err)}
   defer rows.Close();
   //test if this request already exists
   if err := rows.Scan(&ur.id); err == nil {
      //insert 
      report("Inserting turker: "+ tid)
      resp.Message = "successfully inserted turker";
      if _,err := db.Exec("INSERT INTO Users(id) values(?);", tid); err != nil {panic(err)}
   }
   snd_post_resp(&serv,resp);
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
         DROP TABLE IF EXISTS  Users;
         DROP TABLE IF EXISTS  Turkers;
         DROP TABLE IF EXISTS Videos;
         DROP TABLE IF EXISTS Requests;
         DROP TABLE IF EXISTS Work;
         `); err != nil {panic(err);}


   if _, err := db.Exec(`
         CREATE TABLE IF NOT EXISTS Users 
         ( 
            id STRING PRIMARY KEY 
         );`); err != nil {panic(err);}

   if _, err := db.Exec(`
         CREATE TABLE IF NOT EXISTS Turkers 
         ( 
            id STRING PRIMARY KEY 
         );`); err != nil {panic(err);}

   if _, err := db.Exec(`PRAGMA foreign_keys = ON;`); err != nil {panic(err);}


   if _, err := db.Exec(`
         CREATE TABLE IF NOT EXISTS Videos 
         ( 
            id STRING PRIMARY KEY,
            stage STRING,
            data STRING,
            captions STRING
         );`); err != nil {panic(err);}

   if _, err := db.Exec(`
         CREATE TABLE IF NOT EXISTS Requests 
         ( 
            user_id STRING,
            video_id STRING,
            PRIMARY KEY (user_id, video_id),
            FOREIGN KEY(user_id) REFERENCES Users(id) ON UPDATE CASCADE,
            FOREIGN KEY(video_id) REFERENCES Videos(id) ON UPDATE CASCADE
         );`); err != nil {panic(err);}

   if _, err := db.Exec(`
         CREATE TABLE IF NOT EXISTS Work 
         ( 
            stage string, 
            turker_id STRING,
            video_id STRING,
            PRIMARY KEY (turker_id, video_id),
            FOREIGN KEY(turker_id) REFERENCES Turkers(id) ON UPDATE CASCADE,
            FOREIGN KEY(video_id) REFERENCES Videos(id) ON UPDATE CASCADE
         );`); err != nil {panic(err);}


   return db;
}
func SetupAPI(prefix string) {
   var a = new(Api);
   a.db = setupDB();
   a.iface = new(ApiInterface);
   api_handle = a;

   gorest.RegisterService(a.iface);
   gorest.RegisterMarshaller("application/json", gorest.NewJSONMarshaller())
   http.Handle(prefix, gorest.Handle());

}





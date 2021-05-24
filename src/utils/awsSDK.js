
var async = require('async');
const AWS = require('aws-sdk');
var path = require('path');
var Jimp = require("jimp");
var fs = require('fs');
var config = require('../config/config');

//configuring the AWS environment
/*AWS.config.update({
    accessKeyId: config.aws_access_key_id,
    secretAccessKey: config.aws_secret_access_key,
    region:'us-east-2',
    //sslEnabled: true,
});*/

var s3 = new AWS.S3({
  accessKeyId: config.aws_access_key_id,
  secretAccessKey: config.aws_secret_access_key,
  region:'us-east-2',
  //sslEnabled: true,
});

/*
const params = {
			Bucket: file.bucket,
			Key: file.key,
			Expires: 5 * 60, // 5 minutes
		};

		const client = new AWS.S3({
			signatureVersion: 'v4',
		});

		const signedURL = await (new Promise((resolve, reject) => {
			client.getSignedUrl('getObject', params, (err, data) => {
				if (err) {
					reject(err)
				} else {
					resolve(data)
				}
			});
		}));
		
		return String(signedURL)
*/
    
module.exports = {

  is_file_exist: async function (user, file_path, callback) {
 
    var s3_bucket_name = config.s3_bucket_name;
    var folder = 'app/f/'+user+'/';
    var file_name = path.basename(file_path);

    //console.log('file_path:',file_path)
    //console.log('folder:',folder)
    //console.log('file_name:',file_name)
    const params = {
      Bucket: s3_bucket_name,
      Key: folder+file_name
    };

    try {
      s3.headObject(params, function (err, metadata) {
        if (err && err.code === 'NotFound') {  
          //console.error('Error', err)
          callback(null, {found: false})
        } else {  
          //s3.getSignedUrl('getObject', params, callback);  
          callback(null, {found: true})
        }
      });
    } catch (error) {
      console.error('Unexpected Error', error)
      callback(null, {found: true})
    }
  },
  
  upload_file_to_s3: function (file_path, dir, file_name, file_end, callback) {

    try{
      var s3_bucket_name = config.s3_bucket_name;

      var dir1 = path.join('app/f', dir)
      var s3_file_path = path.join(dir1, file_name)
      var dir2 = path.join(s3_bucket_name, dir1)

      dir1 = dir1.replace(/[\\]/g, '/');
      s3_file_path = s3_file_path.replace(/[\\]/g, '/');
      file_path = file_path.replace(/[\\]/g, '/');

      async.waterfall([

        // files
        async.constant(file_path, dir1, file_name, s3_file_path, s3_bucket_name),
        function(file_path, folder, file_name, s3_file_path, s3_bucket_name, cb) {

          var bucketFolder = folder;
          bucketFolder = bucketFolder.replace(/[\\]/g, '/');
          console.log('bucketFolder:',bucketFolder)
          s3.headBucket({Bucket:bucketFolder}, function(err,data){
            if(0 && err){

              const params = {
                Bucket: s3_bucket_name,
                Key: bucketFolder/*+'/'*/,
                ACL: 'public-read',
                Body: ''
              };
  
              //s3.createBucket({Bucket:bucketFolder}, function(err,data){
              //s3.putObject(params, function(err,data){
              s3.upload(params, function(err,data) {
                if(err) {
                  console.log('err aws1:',err)
                }
                //console.log("Bucket created");
                console.log("Folder created");
                cb(null, file_path, folder, file_name, s3_file_path, s3_bucket_name)
              });
            } else {
              console.log("Bucket exists and we have access");
              cb(null, file_path, folder, file_name, s3_file_path, s3_bucket_name)
            }
          });   
        },
        function(file_path, dir, file_name, s3_file_path, s3_bucket_name, cb) {

          fs.readFile(file_path, (err, data) => {

            if (err) {
              console.log("Error read file:", err);
              return callback(err);
            }
            //var base64data = new Buffer(data, 'binary');
            var params = {
              Bucket: s3_bucket_name,
              Key: s3_file_path,
              Body: data
            };
            s3.upload(params, (err, data) => {
              if (err) {
                console.log("Error uploading file:", err);
                return callback(err);
              } else {

                var new_file_path1 = path.join(s3_bucket_name, params.Key)
                //var new_file_path = path.join('https://s3.amazonaws.com', new_file_path1)
                //var new_file_path = 'https://s3.amazonaws.com/'+new_file_path1;
                var new_file_path = config.s3_url_prefix + params.Key;
                
                //console.log("Successfully uploaded file to Bucket "+config.s3_bucket_name+": ",res);
                console.log(`File uploaded successfully at ${new_file_path1}`)

                var obj = {
    
                  id: s3_file_path,
                  url: new_file_path,
                  date: Date.now()
                }
          
                return callback(null, obj);
              }
            });
          });
        }
      ], function(err) {
      });
    }
    catch(err){
      return callback(err);
    } 
  },

  upload_json_to_s3: function (json, dir, file_name, file_end, callback) {

    try{
      var s3_bucket_name = config.s3_bucket_name;

      var dir1 = path.join('app/f', dir)
      var s3_file_path = path.join(dir1, file_name)
      var dir2 = path.join(s3_bucket_name, dir1)

      dir1 = dir1.replace(/[\\]/g, '/');
      s3_file_path = s3_file_path.replace(/[\\]/g, '/');

      async.waterfall([

        // files
        async.constant(json, dir1, file_name, s3_file_path, s3_bucket_name),
        function(json, folder, file_name, s3_file_path, s3_bucket_name, cb) {

          var bucketFolder = folder;
          bucketFolder = bucketFolder.replace(/[\\]/g, '/');
          console.log('bucketFolder:',bucketFolder)
          s3.headBucket({Bucket:bucketFolder}, function(err,data){          
            if(0 && err){

              const params = {
                Bucket: s3_bucket_name,
                Key: bucketFolder/*+'/'*/,
                ACL: 'public-read',
                Body: ''
              };
  
              //s3.createBucket({Bucket:bucketFolder}, function(err,data){
              //s3.putObject(params, function(err,data){
              s3.upload(params, function(err,data) {
                if(err) {
                  console.log('err aws2:',err)
                }
                //console.log("Bucket created");
                console.log("Folder created");
                cb(null, json, folder, file_name, s3_file_path, s3_bucket_name)
              });
            } else {
              console.log("Bucket exists and we have access");
              cb(null, json, folder, file_name, s3_file_path, s3_bucket_name)
            }
          });   
        },
        async function(json, folder, file_name, s3_file_path, s3_bucket_name, cb) {

          var bucketFolder = folder;
          bucketFolder = bucketFolder.replace(/[\\]/g, '/');

          await s3.putObject({
              Bucket: s3_bucket_name+'/'+bucketFolder,
              Key: file_name,
              Body: JSON.stringify(json),
              ContentType: 'application/json; charset=utf-8'
          }).promise();

          var new_file_path1 = path.join(s3_bucket_name, s3_file_path)
          //var new_file_path = path.join('https://s3.amazonaws.com', new_file_path1)
          //var new_file_path = 'https://s3.amazonaws.com/'+new_file_path1;
          var new_file_path = config.s3_url_prefix + s3_file_path;
          
          //console.log("Successfully uploaded file to Bucket "+config.s3_bucket_name+": ",res);
          console.log(`File uploaded successfully at ${new_file_path1}`)

          var obj = {

            id: s3_file_path,
            url: new_file_path,
            folder: folder,
            file_name: file_name,
            date: Date.now()
          }
    
          return callback(null, obj);
        }
      ], function(err) {
      });
    }
    catch(err){
      return callback(err);
    } 
  },

  get_json_file_from_s3: async function (dir, file_name, callback) {

    if (config.s3 == 0) {
      return callback("S3 disable")
    }

    var s3_bucket_name = config.s3_bucket_name;
    var dir1 = path.join('app/f', dir)

    let bucketFolder = dir1.replace(/[\\]/g, '/');

    //let key = path.join(dir1,file_name);

    try {
      // Converted it to async/await syntax just to simplify.
      const data = await s3.getObject(
      {
        Bucket: s3_bucket_name+'/'+bucketFolder,
        Key: file_name,
        //ResponseContentType: 'application/json'
      }).promise();
    
      let json_data = data.Body.toString('utf-8');
      //console.log(json_data);

      callback(null, json_data);
    }
    catch (err) {
      callback(err)
    }
  },


  get_file_from_s3: function (dir, file_name, callback) {

    if (config.s3 == 0) {
      return callback("S3 disable")
    }

    var s3_bucket_name = config.s3_bucket_name;
    var dir1 = path.join('app/f', dir)

    var params = {
      Bucket: s3_bucket_name,
      Key: path.join(dir1,file_name)
    };

    s3.getObject(params,
        function(error, data) {
            if (error != null) {
                alert("Failed to retrieve an object: " + error);
                return callback(error);
            } else {
                alert("Loaded " + data.ContentLength + " bytes");   
                return callback(null, data);
            }
        });
  },
  
  emptyS3Directory: async function (dir) {

    let bucket = config.s3_bucket_name;

    const listParams = {
        Bucket: bucket,
        Prefix: dir/*,
        Key: dir*/
    };

    const listedObjects = await s3.listObjectsV2(listParams).promise();

    if (listedObjects.Contents.length === 0) return;

    const deleteParams = {
        Bucket: bucket,
        Delete: { Objects: [] }
    };

    listedObjects.Contents.forEach(({ Key }) => {
        deleteParams.Delete.Objects.push({ Key });
    });

    await s3.deleteObjects(deleteParams).promise();

    if (listedObjects.IsTruncated) await emptyS3Directory(bucket, dir);

    /*async function emptyS3DirectoryFunc(listParams) {
      return new Promise(async (resolve,reject)=>{

        s3.listObjectsV2(listParams, async function (err, found) {

          if (err) {
              console.log(err);
              resolve();
          } else {
            if (found && found.Contents && (found.Contents.length > 0)) {
              const listedObjects = await s3.listObjectsV2(listParams).promise();

              if (listedObjects.Contents.length === 0) return;

              const deleteParams = {
                  Bucket: bucket,
                  Delete: { Objects: [] }
              };
          
              listedObjects.Contents.forEach(({ Key }) => {
                  deleteParams.Delete.Objects.push({ Key });
              });
          
              await s3.deleteObjects(deleteParams).promise();
          
              if (listedObjects.IsTruncated) await emptyS3Directory(bucket, dir);
            } else {
            }
            resolve();
          }
        });

      });
    }

    const pormises = []
    pormises.push(emptyS3DirectoryFunc(listParams))
    await Promise.all(pormises)*/

    return;
  },

  delete_file_from_s3: function (dir, file_name, callback) {

    if (config.s3 == 0) {
      return callback("S3 disable")
    }

    if (file_name.length < 2) {
      return callback("file name not exist")
    }

    var s3_bucket_name = config.s3_bucket_name;

    var file_path = file_name;
    var dir1 = path.join('app/f', dir)
    if (dir1 && (dir1.length > 1)) {
      file_path = path.join(dir1,file_name)
    }

    var params = {
      Bucket: s3_bucket_name,
      Key: dir+file_name
    };

    s3.deleteObject(params, function (err, data) {
      if (err) {
        console.log("File deleted failed:",err);
        return callback(err);
      } else {
        console.log("File deleted successfully:",file_path);
        return callback(null, data);
      }
    });
  },

  get_all_files_from_s3: function (dir, callback) {

      var s3_bucket_name = config.s3_bucket_name;

      var params = {
          Bucket: s3_bucket_name,
          Delimiter: '',
          Prefix: dir
      };

      var files = [];
      s3.listObjects(params, function (err, data) { //

          if (err) {
            console.log('err aws3: ',err);
            return callback(null, files);
          }

          if (data) {

              async.each(data.Contents, function (key, cb) {

                  var params2 = {
                    Bucket: config.s3_bucket_name,
                    Key: key.Key
                  };

                  {
                          var str = key.Key;
                          var res = str.replace(/[/]/g, "~");

                          var str2 = key.Key;
                          var filename = path.basename(str2);
                            var str3 = filename;//str2;
                            var res2 = str3.split(".");
                            if (res2.length > 1) {
                              str2 = res2[0];

                              var str22 = key.Key;
                              var str_debug_key = str22.replace("saved", "debug");
                              var params22 = {
                                Bucket: config.s3_bucket_name,
                                Key: str_debug_key
                              };

                              {
                                      var str = str_debug_key;
                                      var res2 = str.replace(/[/]/g, "~");

                                      var str22 = str_debug_key;
                                      var filename2 = path.basename(str22);
                                      var str33 = filename2;
                                      var res22 = str3.split(".");
                                      if (res22.length > 1) {
                                        str22 = res22[0];

                                        files.push({
                                          s3_bucket_name: config.s3_bucket_name,
                                          file_name: str2,
                                          saved: {
                                            full_path: key.Key,
                                            path: res
                                          },
                                          debug: {
                                            full_path: str_debug_key,
                                            path: res2
                                          }
                                        });
                                      }
                                  }
                                  cb();
                            } else {
                              cb();
                            }
                      }
              },
              // 3rd param is the function to call when everything's done
              function(err) {
                // All tasks are done now
                //console.log('== files: ', files);
                return callback(null, files);
              }
            );
          }
      });
  },

  get_all_files_from_dir_s3: function (dir, category, callback) {

      var s3_bucket_name = config.s3_bucket_name;

      var params = {
          Bucket: s3_bucket_name,
          Delimiter: '',
          Prefix: dir
      };

      var files = [];
      s3.listObjects(params, function (err, data) {

          if (err) {
            console.log('err aws4: ',err);
            return callback(null, files);
          }

          //console.log('data.Contents:',data.Contents)
          if (data) {

              async.each(data.Contents, function (key, cb) {

                //var file_path1 = path.join(s3_bucket_name, key.Key)
                var file_path1 = s3_bucket_name+'/'+key.Key;
                //var file_path = 'https://s3.amazonaws.com/'+file_path1;
                //var file_path = path.join('https://deepnen.s3.amazonaws.com', key.Key)
                var file_path = config.s3_url_prefix + key.Key;

                //console.log('key:',key.Key)
                //console.log('file_path:',file_path)

                if ((key.Key.length == 0) || 
                    (key.Key.length > 0) && ((key.Key[key.Key.length-1] == '/') || (key.Key[key.Key.length-1] == '\\'))) {
                } else {
                  var obj = {

                    id: key.Key,
                    url: file_path,
                    date: key.LastModified
                  }

                  files.push(obj)
                }
                cb();
              },
              // 3rd param is the function to call when everything's done
              function(err) {
                return callback(null, files);
              }
            );
          }
      });
  }
};


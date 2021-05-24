var fs = require('fs');
//var fs = require('fs-extra');
var async = require('async');
let path = require("path");
var config = require('../config/config');
var JFile=require("jfile");
var apikey = require("apikeygen").apikey;
const lineReader = require('line-reader');
const lineByLine = require('n-readlines');
//const readline = require('readline');
var readline = require('linebyline')
//const pdfreader = require("pdfreader");
//const unoconv = require('awesome-unoconv');
//const pdf2html = require('pdf2html')
//var pdf_extract = require('pdf-extract');
//const PDFExtract = require('pdf.js-extract').PDFExtract;
//const pdfjs = require('pdfjs-dist')

const extractwords = require('extractwords');
//const pdf = require('pdf-parse');
var mammoth = require("mammoth");
var textract = require('textract');
var pdfUtil = require('pdf-to-text');
var docx4js = require('docx4js');
//var docx2html = require('docx2html');
//var wordtohtml = require('word-to-html');
const EasyDocx = require('node-easy-docx');
var docxParser = require('docx-parser');
const officeParser = require('officeparser');
var getDocumentProperties = require('office-document-properties');
var convert = require('xml-js');
var extract = require('pdf-text-extract')
const pdf = require("pdf-extraction");
var AdmZip = require('adm-zip');
var IndexedMap = require('indexed-map');
//const Keyv = require('keyv');
//const keyv = new Keyv();
var awsSDK = require('../utils/awsSDK')
var utils = require('../utils/utils')
// Get the samples from http://www.adobe.com/go/pdftoolsapi_node_sample
//var unoconv = require('unoconv');
var CloudmersiveConvertApiClient = require('cloudmersive-convert-api-client');
//var pdf_officegen = require('pdf-officegen');
//const wordsApi = new WordsApi(clientId, clientSecret, baseUrl);
var PDFParser = require("pdf2json");
//const officegen = require('officegen')

//const pdf = require('pdf-parse');

var defaultClient = CloudmersiveConvertApiClient.ApiClient.instance;
// Configure API key authorization: Apikey
var Apikey = defaultClient.authentications['Apikey'];
Apikey.apiKey = '67a2a535-04f1-4fa2-afe2-e294b827dcd4';

let Zamzar_Apikey = "90479b8f970d975263625f2f1b66f3b34077f060"
let pdf_to_ApiKey = 'ak_a56b66e02cc1401b89d330dfc75dfe00'
let pdf_co_api_key = 'ring.dudu@gmail.com_8501de0876011830'
let imgn_sharp_api_key = 'ef6d9c2c-21fe-4bf8-9572-ae371f53694e'
let adobe_api_key = 'b7de19d1069d40dfaed4f3ce4fae027e'

//var apiInstance = new CloudmersiveConvertApiClient.ConvertDocumentApi();
//const uploadRequest = new UploadFileRequest();

//var countMap = IndexedMap();
//let pdf = officegen('pdf')

const re = /^\d*(\.\d+)?$/

function retnum(str) { 
  var num = str.replace(/[^0-9]/g, ''); 
  return parseInt(num,10); 
}

function getSceneId(chapter_number, scene_number) {
	let scene_id = 0
	let cn = parseInt(chapter_number);
	if (isNaN(cn)) {
		cn = 0;
	}
	let sn = parseInt(scene_number);
	if (isNaN(sn)) {
		sn = 0;
	}
	if (scene_number < 10) {
		scene_id = (cn * 100) + sn;
	} else {
		scene_id = (cn * 10) + sn;
	}
	return scene_id;
}

async function getScriptBreakdownFromJson(local_path, text, json_obj, cb) {

  let indexedMap = null;

  try {
    indexedMap = IndexedMap();

    let chapter_number1 = 0;

    /*require('fs').readFileSync(local_path, 'utf-8').split(/\r?\n/).forEach(function(line1) {

      let line = line1.toString('utf8')
      let num = retnum(line);
      if ((chapter_number1 == 0) && num && !isNaN(num) && (num > 0)) {
        chapter_number1 = num;
      }
    });*/

    /*const liner = new lineByLine(local_path);
    //const liner = new lineByLine(file_path);
    let line1;
    while ((line1 = liner.next()) && (chapter_number1 == 0)) {
      //let line = parseString(line1)

      let line = line1.toString('utf8')
      let num = retnum(line);
      if ((chapter_number1 == 0) && num && !isNaN(num) && (num > 0)) {
        chapter_number1 = num;
      }
    }*/

    /*lineReader.eachLine(local_path, (line, last) => {
      console.log('line:',line);

      let num = retnum(line);
      if ((chapter_number1 == 0) && num && !isNaN(num) && (num > 0)) {
        chapter_number1 = num;
      }      
    });*/

    let lines_ = text.split(/\r?\n/);
  
    let lines = lines_.filter(function (el) {
      return ((el != null) && (el.length > 0));
    });

    // let index = 0;
    // // print all lines
    // lines.forEach((line) => {
    //   index++;
    //   console.log(line);
    // });

    //console.log(json_obj['w:document'])

    let json = JSON.parse(json_obj);

    //console.log('json:',JSON.stringify(json))

    let script_data = []
    if (json && 
      json['w:document'] && 
      json['w:document']['w:body'] && 
      json['w:document']['w:body']['w:p'] && 
        (json['w:document']['w:body']['w:p'].length > 0)) {
      script_data = json['w:document']['w:body']['w:p'];
    }

    //console.log('script_data:',JSON.stringify(script_data))

    /*indexedMap.close()
    indexedMap.insert(json.session, json);
    var obj = indexedMap.get(json.session);
    indexedMap.length
    indexedMap.remove( json.session );*/

    /*await keyv.set('foo', 'expires in 1 second', 1000); // true
    await keyv.set('foo', 'never expires'); // true
    await keyv.get('foo'); // 'never expires'
    await keyv.delete('foo'); // true
    await keyv.clear(); // undefined*/

    //await keyv.clear(); // undefined*/

    let index = 0;
    let scripts = []
    if (script_data && (script_data.length > 0)) {
      //script_data.forEach(async(element) => {
      for(var a in script_data) {
        var element = script_data[a];
        if (element) {

          if (index <= 10) {
            //console.log('script_data::::::::::::::::::::',JSON.stringify(element))
          }

          index++;

          let text = '';
          let style = '';
          let position = '';
          if (element['w:pPr'] && element['w:pPr']['w:pStyle'] && element['w:pPr']['w:pStyle']['_attributes'] && element['w:pPr']['w:pStyle']['_attributes']['w:val']) {
            style = element['w:pPr']['w:pStyle']['_attributes']['w:val'];
          }
          if (style && (style.length > 0)) {
            style = style.toLowerCase().trim();
          }
          if (element['w:pPr'] && element['w:pPr']['w:jc'] && element['w:pPr']['w:jc']['_attributes'] && element['w:pPr']['w:jc']['_attributes']['w:val']) {
            position = element['w:pPr']['w:jc']['_attributes']['w:val'];
          }
          if (position && (position.length > 0)) {
            position = position.toLowerCase().trim();
          }
          if (element['w:r'] && Array.isArray(element['w:r'])) {
            //element['w:r'].forEach(element2 => {
            for(var b in element['w:r']) {
              var element2 = element['w:r'][b];
              if (element2 && element2['w:t'] && element2['w:t']['_text']) {
                text += ' '+element2['w:t']['_text'];
              }
            }//)
          } else {
            if (element['w:r'] && element['w:r']['w:t'] && element['w:r']['w:t']['_text']) {
              text = element['w:r']['w:t']['_text'];
            }
          }

          if ((chapter_number1 == 0) && text && (text.length > 0)) {
            let num = retnum(text);
            if ((chapter_number1 == 0) && num && !isNaN(num) && (num > 0)) {
              chapter_number1 = num;
            }
          }

          if (style && (style.length > 0) && text && (text.length > 0)) {

            let text1 = text.replace(/[0-9./]/g, '');
            if (
              (text1.length == 0) || 
              text1.match(re)
              ) {
              //let i = 0;
            } else {
              if (
                (position == 'center') && (index <= 1)
                ) {
                  style = 'header'
              }
              let text_param = {
                text: text
              }
              //let text_arr = await keyv.get(style);
              //let style_arr = await keyv.get('style');
              let text_arr = indexedMap.get(style);
              let style_arr = indexedMap.get('style');
              if (!text_arr) {
                text_arr = []
              }
              text_arr.push(text)
              //await keyv.set(style, text_arr);
              indexedMap.insert(style, text_arr);
              let style_exist = false;
              if (!style_arr) {
                style_arr = [];
              } else {
                //style_arr.forEach(style_obj => {
                for(var a in style_arr) {
                  let style_obj = style_arr[a];
                  if (style_obj == style) {
                    style_exist = true;
                  }
                }//)
              }
              if ((style_arr.length == 0) || !style_exist) {
                style_arr.push(style)
                //await keyv.set('style', style_arr);
                indexedMap.insert('style', style_arr);
              }

              let obj = {
                style: style.toLowerCase().trim(),
                position: position.toLowerCase().trim(),
                text: text/*.toLowerCase().trim()*/,
                type: ''
              }

              //console.log('text:',text)
              //console.log('style:',style)
              
              scripts.push(obj)
            }
            //console.log('text:',text)
            //console.log('style:',style)
          }
        }
      }//);

      //console.log('scripts:',scripts);

      //let style_arr2 = await keyv.get('style');
      let style_arr2 = indexedMap.get('style');

      let style_arr = []
      let word_len_arr = []  
      let word_count_arr = []  
      let num_count_arr = []
      //console.log('styles:',style_arr2)
      if (style_arr2) {
        //style_arr2.forEach(async(style_obj2) => {
        for(var a in style_arr2) {
          let style_obj2 = style_arr2[a];
          //let text_arr2 = await keyv.get(style_obj2);
          let text_arr2 = indexedMap.get(style_obj2);

          let len = 0;
          let word_len = 0;
          let total_word_len = 0;
          let count = 0;
          let num_count = 0;
          let num_count_avg = 0;
          if (text_arr2) {
            len = text_arr2.length;
            text_arr2.forEach(async(text_obj) => {

              let text_obj1 = text_obj.trim();

              let num_text = text_obj1.substring(0, 2);

              if (!isNaN(num_text)) {
                num_count++;
              }

              let str1 = text_obj.replace(/(^\s*)|(\s*$)/gi,"");
              let str11 = str1.replace(/[ ]{2,}/gi," ");
              let str111 = str11.replace(/\n/,"\n");

              let text_word_len = str111.split(' ').length;
              total_word_len += text_word_len;
              count++;
            })
          }

          if ((len > 0) && (total_word_len > 0)) {
            word_len = total_word_len / len;
          }

          if ((len > 0) && (num_count > 0)) {
            num_count_avg = num_count / len;
          }

          style_arr.push(style_obj2);
          word_len_arr.push(word_len);
          word_count_arr.push(count);
          num_count_arr.push(num_count_avg);

          //console.log(style_obj2+':',text_arr2);
        }//)
      } else {
      }

      console.log('style_arr:',style_arr)
      console.log('word_count_arr:',word_count_arr)
      console.log('word_len_arr:',word_len_arr)
      console.log('num_count_arr:',num_count_arr)

      let title_pos = 0;
      let character_len = 100;
      let character_pos = 0;
      let text_len = 0;
      let text_pos = 0;
      let scene_len = 0;
      let scene_pos = 0;
      let def_len = 0;
      let def_pos = 0;
      for (var i = 0; i < style_arr.length; i++) {
        let style = style_arr[i];
        let word_count = word_count_arr[i];
        let word_len = word_len_arr[i];
        let num_count = num_count_arr[i];

        if ((word_len < character_len) && (word_count > 5)) {
          character_pos = i;
          character_len = word_len;
        }
        if ((word_len > text_len) && (word_count > 5)) {
          text_pos = i;
          text_len = word_len;
        }
        if (num_count > scene_len) {
          scene_pos = i;
          scene_len = num_count;
        }
      }

      text_pos = character_pos + 1;
      if (text_pos < style_arr.length) {
        text_len = word_len_arr[text_pos];
      }
      def_pos = scene_pos + 1;
      if (def_pos < style_arr.length) {
        def_len = word_len_arr[def_pos];
      }

      if (
        (def_pos == character_pos) || 
        (def_pos == text_pos) || 
        (def_pos == scene_pos)
      ) {
        let set_def_pos = false;
				for (var i = (style_arr.length-1); ((i >= 0) && !set_def_pos); i--) {
          let style = style_arr[i];
          switch (i) {
            case character_pos:
            case text_pos:
            case scene_pos:
              break;

            default:
              def_pos = i;
              set_def_pos = true;
              break;
          }
        }
      }

      console.log('character_len:',character_len)
      console.log('character_pos:',character_pos)
      console.log('text_len:',text_len)
      console.log('text_pos:',text_pos)
      console.log('scene_len:',scene_len)
      console.log('scene_pos:',scene_pos)
      console.log('def_len:',def_len)
      console.log('def_pos:',def_pos)

      let script_obj = {
        name: '',
        date: '',
        scenes: []
      }
      
      let scene_obj = {}
      let character_script_obj = {}
      let characters_arr = [];
      let script_arr = [];
      let chapter_number = 0;
      let chapter_number_scene_exist = false;
      let scene_number_count = 0;

      function script_obj_breakdown(script) {
        let new_script = null;
        if (script) {
          let style = script.style;
          let text = script.text;
      
          switch (style) {
      
            case style_arr[scene_pos]: {
      
              script.type = 'scene';
              
              let scene_text_words = [];
              if (text && (text.length > 0)) {
                scene_text_words = extractwords(text, {lowercase: true, punctuation: false});
              }
      
              text = text.replace(/,/g,".");
              let split_str = text.split('.')
              for (var i = 0; i < split_str.length; i++) {
                split_str[i] = split_str[i].toLowerCase().trim();
              }
      
              console.log('text:',text)
              console.log('split_str:',split_str)
      
              let scene_number = 0
              //let num_word = scene_text_words[0];
              let num_word = split_str[0];
              let sub_scene = false;
              if (scene_text_words && num_word && (num_word.length > 0)) {
                let last_char = num_word.substring(num_word.length - 1, num_word.length);
                let num = parseInt(last_char);
                if (isNaN(num)) {
                  let num_word1 = num_word.substring(0, num_word.length - 1)
                  num = parseInt(num_word1);
                  if (isNaN(num)) {
                    split_str[4] = split_str[3];
                    split_str[3] = split_str[2];
                    split_str[2] = split_str[1];
                    split_str[1] = split_str[0];
                    split_str[0] = num_word;
                  } else {
                    
                    let scene1 = num_word1.substring(num_word1.length - 2, num_word1.length);
                    let chapter1 = num_word1.substring(0, num_word1.length - 2);
                    let scene_number1 = parseInt(scene1);
                    let num_chapter1 = parseInt(chapter1);
      
                    let found = false;
                    for (var i = 0; i < (script_obj.scenes.length && !found); i++) {
                      let scene_obj1 = script_obj.scenes[i];
                      if (scene_obj1.scene_number == scene_number1) {
                        sub_scene = true;
                        found = true;
                      }
                    }
                    if (!found) {
                      if (scene_obj && (scene_obj.scene_number == scene_number1)) {
                        sub_scene = true;
                        found = true;
                      } else {
                        num_word = num_word1;
                      }
                    }
                  }
                }
      
                if (!split_str[2]) {
                  split_str[2] = split_str[1];
                  split_str[1] = '';
                }
      
                let scene = num_word.substring(num_word.length - 2, num_word.length);
                let chapter = num_word.substring(0, num_word.length - 2);
                scene_number = parseInt(scene);
                scene_number_count++;
                if (isNaN(scene_number) || (scene_number <= 0)) {
                  scene_number = scene_number_count;
                }
                let num_chapter = parseInt(chapter);
                //if (chapter_number == 0 || (!chapter_number_scene_exist && (num_chapter > 0))) {
                if (!isNaN(num_chapter) && (num_chapter > 0) && (chapter_number == 0)) {
                  chapter_number = num_chapter;
                  chapter_number_scene_exist = true;
                }
              }
      
              let location = '';
              if (split_str[1] && (split_str[1].length > 0)) {
                location = split_str[1].trim();
              }
      
              let name = '';
              if (split_str[2] && (split_str[2].length > 0)) {
                name = split_str[2].trim();
              }
      
              let time = '';
              if (split_str[3] && (split_str[3].length > 0)) {
                time = split_str[3].trim();
              }
      
              let state = '';
              if (split_str[4] && (split_str[4].length > 0)) {
                state = split_str[4].trim();
              }
      
              if (sub_scene) {
                let obj = {
                  text: text,
                  type: 'scene_def'
                }
                script_arr.push(obj);
              } else {
                
                if (scene_obj && scene_obj.param_text && (scene_obj.param_text.length > 0)) {
                  scene_obj = { ...scene_obj, script: script_arr }
                  script_obj.scenes.push(scene_obj);
                  //console.log('scene_obj:',scene_obj)
                }
      
                let place = '';
      
                if ((chapter_number == 0) && (chapter_number1 > 0)) {
                  chapter_number = chapter_number1;
                }

                let scene_id = getSceneId(chapter_number, scene_number);

                scene_obj = {
                  type: 'scene',
                  name: name,
                  location: location,
                  place: place,
                  time: time,
                  state: state,
                  scene_number: scene_number,
                  chapter_number: chapter_number,
                  scene_id: scene_id,
                  text: '',
                  param_text: text,
                  extras: 0,
                  extras_text: '',
                  bits: 0,
                  bits_text: '',
                  scene_duration: 0
                }
      
                if (script_obj && script_obj.chapter_number && (script_obj.chapter_number <= 0) && (chapter_number > 0)) {
                  script_obj.chapter_number = chapter_number;
                }
                
                script_arr = [];
              }
      
              break;
            }
            case style_arr[def_pos]: {
              script.type = 'def';
              let obj = {
                text: text,
                type: 'def'
              }
              script_arr.push(obj);
              break;
            }
            case style_arr[character_pos]: {
              script.type = 'character';
      
              var subString = '';
              if (text.includes('(') && text.includes(')')) {
                subString = text.substring(
                  text.lastIndexOf('(') + 1,
                  text.lastIndexOf(')')
                );
                if (subString.length == 0) {
                  subString = text.substring(
                    text.lastIndexOf(')') + 1,
                    text.lastIndexOf('(')
                  );
                }
              }
              if (subString.length > 0) {
                text = text.replace(subString, '');
                text = text.replace('(', '');
                text = text.replace(')', '');
                text = text.trim();
      
                new_script = {
                  style: style_arr[def_pos],
                  text: subString,
                  type: 'def'
                }
              }
      
              {
                character_script_obj = {
                  character: text,
                  text: '',
                  type: 'character'
                }
      
                let character_exist = false;
                for(var k in characters_arr) {
                  var character = characters_arr[k];
                  if (character && (character == text)) {
                    character_exist = true;
                  }
                }
                if (!character_exist) {
                  characters_arr.push(text);
                }
              }
              break;
            }
            case style_arr[text_pos]: {
              script.type = 'text';
              character_script_obj.text = text;
              script_arr.push(character_script_obj);
              break;
            }
            case style_arr[title_pos]: {
              if (text && (text.length > 0)) {
                script.type = 'title';
      
                script_obj.name = text;
                //console.log('title:',text);
                var str = text;
                str = str.replace(/[^0-9]/g, '');
                let num = parseInt(str);
                if (!isNaN(num)) {
                  chapter_number = num;
                }
                //console.log('chapter_number:',chapter_number);
              }
      
              break;
            }
          }
        }
        return new_script;
      }

      //scripts.forEach(async(script) => {
      for(var a in scripts) {
        let script = scripts[a];
        if (script) {
          let new_script = script_obj_breakdown(script);
          while (new_script) {
            new_script = script_obj_breakdown(new_script);
          }
        }
      }//)

      if (scene_obj && scene_obj.param_text && (scene_obj.param_text.length > 0)) {
        scene_obj = { ...scene_obj, script: script_arr }
        script_obj.scenes.push(scene_obj);
        //console.log('scene_obj:',scene_obj)
      }

      if ((chapter_number == 0) && (chapter_number1 > 0)) {
        chapter_number = chapter_number1;
      }

      script_obj = { ...script_obj, characters_name: characters_arr, chapter_number: chapter_number }
      //console.log('script:', JSON.stringify(script_obj))
      //console.log('script:', script_obj)

      //console.log('script_obj======================:',JSON.stringify(script_obj))
      cb(null, script_obj)
    } else {
      cb('no script data')
    }
  } catch (err) {
    console.log('err1:',err)
    cb(err);
  }
}

//return an array of objects according to key, value, or key and value matching
function getObjects(obj, key, val) {
  var objects = [];
  for (var i in obj) {
      if (!obj.hasOwnProperty(i)) continue;
      if (typeof obj[i] == 'object') {
          objects = objects.concat(getObjects(obj[i], key, val));    
      } else 
      //if key matches and value matches or if key matches and value is not passed (eliminating the case where key matches but passed value does not)
      if (i == key && obj[i] == val || i == key && val == '') { //
          objects.push(obj);
      } else if (obj[i] == val && key == ''){
          //only add if the object is not already in the array
          if (objects.lastIndexOf(obj) == -1){
              objects.push(obj);
          }
      }
  }
  return objects;
}

//return an array of values that match on a certain key
function getValues(obj, key) {
  var objects = [];
  for (var i in obj) {
      if (!obj.hasOwnProperty(i)) continue;
      if (typeof obj[i] == 'object') {
          objects = objects.concat(getValues(obj[i], key));
      } else if (i == key) {
          objects.push(obj[i]);
      }
  }
  return objects;
}

//return an array of keys that match on a certain value
function getKeys(obj, val) {
  var objects = [];
  for (var i in obj) {
      if (!obj.hasOwnProperty(i)) continue;
      if (typeof obj[i] == 'object') {
          objects = objects.concat(getKeys(obj[i], val));
      } else if (obj[i] == val) {
          objects.push(i);
      }
  }
  return objects;
}

module.exports = {

  script_breakdown_1: function (file_path, content, cb) {

    var stream = fs.createReadStream(file_path);
    var found = false;
    stream.on('data',function(d){
      if(!found) found=!!(''+d).match(content)
    });
    stream.on('error',function(err){
        then(err, found);
    });
    stream.on('close',function(err){
        then(err, found);
    });

    cb(null, null)
  },

  script_breakdown_2: function (path, content, cb) {

    fs.readFile(path.join(__dirname, "filePath"), "utf8",(data, err) => {
      //console.log(data); // logs file content in string
    });

    fs.readFile(path.join(__dirname, "filePath"), (data, err) => {
      //console.log(data); // logs file content in buffer
    });

    cb(null, null)
  },

  script_breakdown_3: function (file_path, local_path, content, cb) {

    console.log('file_path:',file_path);
    console.log('local_path:',local_path);
    console.log('content:',content);

    //var script_file=new JFile(file_path);
    //var result=script_file.grep(content);
    //result=script_file.grep("word",true) // Add 2nd argument "true" to ge index of lines which contains "word"/

    /*myFile.grep((line,index)=>{
      return (line.indexOf("active")>0) && (index>3)
    });*/

    //console.log('result:::',result);

    //lineReader.eachLine(file_path, (line) => {
    lineReader.eachLine(local_path, (line, last) => {
      //console.log('line:',line);
  
      // stop if line contains `NEW`
      if(line.includes(content)) {
          // stop reading and close the file
          //console.log('line end:',line)
          cb(null, null)
          return false;
      }

      if(last){
        // or check if it's the last one
      }      
    });

    /*lineReader.open(local_path, function(reader) {
      if (reader.hasNextLine()) {
          reader.nextLine(function(line) {
              console.log(line);
          });
      }
    });*/
  },

  script_breakdown: async function (file_path, local_path, folder, file_name, content, scene_location_bank_arr, scene_time_bank_arr, project_id, cb) {

		try {

      console.log('file_path:',file_path);
      console.log('local_path:',local_path);
      console.log('content:',content);
      
      var name = path.basename(local_path);
      var file_end = name.split('.')[1];

      let content_words = [];
      if (content && (content.length > 0)) {
        content_words = extractwords(content, {lowercase: true, punctuation: true});
      }

      //console.log('content_words:',content_words);

      if ((file_end == 'pdf') /*|| (file_end == 'docx')*/) {

        try {

          let dataBuffer = fs.readFileSync(local_path);
 
          //pdf(dataBuffer).then(function(data) {

              // number of pages
              // console.log(data.numpages);
              // // number of rendered pages
              // console.log(data.numrender);
              // // PDF info
              // console.log(data.info);
              // // PDF metadata
              // console.log(data.metadata);
              // // PDF.js version
              // // check https://mozilla.github.io/pdf.js/getting_started/
              // console.log(data.version);
              // // PDF text

              //console.log('data2:',data.text);
              //let data2 = data.text;

              let json_sent = false;

              //let pdfParser = new PDFParser(this,1);
              let pdfParser = new PDFParser(this,1);
              
              pdfParser.on("pdfParser_dataError", errData => {
                console.error('pdfParser_dataError:',errData.parserError)
              });
              pdfParser.on("pdfParser_dataReady", pdfData => {
    
                let data = pdfParser.getRawTextContent()
                //let data2 = pdfParser.getAllFieldsTypes()
    
                //console.log('data:',data)
                //let str = JSON.stringify(pdfData);
                //console.log("JSON:",str2.substring(str2.length - 1001, str2.length -1))
                //console.log("JSON:",data)
                console.log('pdfParser_dataReady')
    
                if (!json_sent) {
                  console.log('Send JSON data')
                  json_sent = true;
                  let scene_location_bank = '';
                  for (var i = 0; i < scene_location_bank_arr.length; i++) {
                    let scene_location = scene_location_bank_arr[i];
                    //if (scene_location && (scene_location.length > 0)) {
                      scene_location_bank += scene_location + ';';
                    //}
                  }
                  let scene_time_bank = '';
                  for (var i = 0; i < scene_time_bank_arr.length; i++) {
                    let scene_time = scene_time_bank_arr[i];
                    //if (scene_time && (scene_time.length > 0)) {
                      scene_time_bank += scene_time + ';';
                    //}
                  }
    
                  var folder = 'p/'+project_id;
    
                  //var name = path.basename(file_path);
                  let file_name_json = apikey(10)+ ".json";
                  awsSDK.upload_json_to_s3(pdfData, folder, file_name_json, 'json', async function(err, result) {
          
                    if (err) {
                      return cb(err);
                    }
    
                    let file_path_json = result.url;
                    let json = '';//JSON.stringify(pdfData);
                    var params = {
                      session: session,
                      params: {
                        method: 'script-brackdown-pdf'
                      },
                      data: {
                        data: data,
                        file_path: file_path,
                        file_path_json: file_path_json,
                        // local_path: local_path,
                        folder: result.folder,
                        file_name: file_name,
                        file_name_json: file_name_json,
                        scene_location_bank: scene_location_bank,
                        scene_time_bank: scene_time_bank
                      }
                    }
    
                    var api_path = 'script-breakdown-pdf/'
                    utils.postToApi(api_path, params, function(err, body) {
                      if (err) {
                        console.log('err6:', err);
                        return cb(err);
                      }
    
                      let ret = {}
                      try {
                        ret = JSON.parse(body);
                      } catch (err) {
                        //console.log('body error:',body)
                        return cb(body);
                      }
                      //console.log('body:', body);
                      return cb(null, ret);
                    });
                  });
                }
              });
          
              pdfParser.loadPDF(local_path);    
          //});

          // let dataBuffer = fs.readFileSync(local_path);
 
          // pdf(dataBuffer)
          //     .then(function (data) {
          //       let i = 0;
          //     })
          //     .catch(function (error) {
          //       let i = 0;
          //     });

        } catch (err) {
          console.log('err2:', err);
        }

      } else {

        if ((file_end == 'fdr') || /*(file_end == 'pdf') ||*/ (file_end == 'docx') || (file_end == 'ppt') || (file_end == 'xlsx') || (file_end == 'odt') || (file_end == 'odp') || (file_end == 'ods')) {

          console.log('docx parser')

          if (config.breakdown_server) {

            var now = new Date();
            var ticks = now.getTime();
            var rnd = Math.floor(Math.random() * 10000);
            var session = ticks.toString() + "_" + rnd.toString();

            //file_path = file_path.replace(/[/]/g, '\\');
            //local_path = local_path.replace(/[/]/g, '\\');

            let scene_location_bank = '';
            for (var i = 0; i < scene_location_bank_arr.length; i++) {
              let scene_location = scene_location_bank_arr[i];
              //if (scene_location && (scene_location.length > 0)) {
                scene_location_bank += scene_location + ';';
              //}
            }
            let scene_time_bank = '';
            for (var i = 0; i < scene_time_bank_arr.length; i++) {
              let scene_time = scene_time_bank_arr[i];
              //if (scene_time && (scene_time.length > 0)) {
                scene_time_bank += scene_time + ';';
              //}
            }

            var params = {
              session: session,
              params: {
                method: 'script-brackdown'
              },
              data: {
                file_path: file_path,
                local_path: local_path,
                folder: folder,
                file_name: file_name,
                scene_location_bank: scene_location_bank,
                scene_time_bank: scene_time_bank
              }
            }

            var api_path = 'script-breakdown/'
            utils.postToApi(api_path, params, function(err, body) {
              if (err) {
                console.log('err6:', err);
                return cb(err);
              }

              let ret = {}
              try {
                ret = JSON.parse(body);
              } catch (err) {
                //console.log('body error:',body)
                return cb(body);
              }
              //console.log('body:', body);
              return cb(null, ret);
            });
          } else {

            //mammoth.convertToHtml({path: local_path}, options)
            mammoth.extractRawText({path: local_path})
            //mammoth.convertToMarkdown({path: local_path})
                .then(function(result){
                    var text = result.value; // The raw text 
                    var messages = result.messages;

                    //console.log(result);

                    const zip = new AdmZip(local_path);
                    //const xml = zip.readAsText('word/document.xml');
                    //var zipEntries = zip.getEntries();
                    const xml = zip.readAsText('word/document.xml');
                    //console.log('============================================',xml)
                    var result_json = convert.xml2json(xml, {compact: true, spaces: 4});
                    //console.log('============================================',result_json)
                    //var result2 = convert.xml2json(xml, {compact: false, spaces: 4});
                    //console.log(result_json)
                    //console.log(result2)
            
                    getScriptBreakdownFromJson(local_path, text, result_json, function(err, result) {
                      cb(err, result)
                    })
                })
                .done();
          }
 
        } else {
          const liner = new lineByLine(local_path);
          //const liner = new lineByLine(file_path);

          let line1;
          while (line1 = liner.next()) {
            //let line = parseString(line1)

            let line = line1.toString('utf8')
            //console.log('line:',line1);
            let words = extractwords(line, {lowercase: true, punctuation: true});
            if(line.includes(content)) {
              //console.log('line found:',line);
              liner.close();
            }
          }
          cb(null, null)
        }
      }
		} catch (err) {
			cb(err);
		}
  }
}

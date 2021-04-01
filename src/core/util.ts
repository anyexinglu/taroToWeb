import * as fs from "fs";
import * as Path from "path";

/**
 * 递归创建目录
 */
export const makeDirs = (path) => {
  if (fs.existsSync(path)) {
    return true;
  }
  if (makeDirs(Path.dirname(path))) {
    fs.mkdirSync(path);
    return true;
  }
};

export function deleteAll(path) {
  let files: any[] = [];
  if (fs.existsSync(path)) {
    files = fs.readdirSync(path);
    files.forEach(function (file, _index) {
      var curPath = path + "/" + file;
      if (fs.statSync(curPath).isDirectory()) {
        // recurse
        deleteAll(curPath);
      } else {
        // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
}

// 指定路径下创建文件并写入 code
export const writeFile = (path, code) => {
  let lastSlash = path.lastIndexOf("/");
  let dir;
  let fileName;
  if (lastSlash >= 0) {
    dir = path.slice(0, lastSlash);
    fileName = path.slice(lastSlash + 1);
  } else {
    fileName = path;
  }
  if (dir) {
    makeDirs(dir);
  }
  console.log("...dir", dir, fileName);
  fs.writeFileSync(path, code);
  // if (fs.existsSync(path))
};

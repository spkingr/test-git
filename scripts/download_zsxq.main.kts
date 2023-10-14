@file:DependsOn("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3")

/*
Download 《知识星球》 videos.
Use your cookie, file name with special characters will fail.
Also, you can use shell scrip to download multiple files in one command.
 */

import java.util.*
import java.io.*
import java.net.*
import kotlin.system.exitProcess
import kotlinx.coroutines.*

val CLEAR = "\u001B[0m"
val RED = "\u001B[31m"
val GREEN = "\u001B[32m"
val YELLOW = "\u001B[33m"
val CYAN = "\u001B[36m"
val WHITE = "\u001B[37m"

val COOKIE = "zsxq_access_token=YOUR_COOKIE_HERE"
val PREFIX = "https://videos.zsxq.com/"
val CONFIG = mutableMapOf<String, String>()

var GLOBAL_LEVEL = 3 // 3-all 2-info and 1, 1-emphasis and error, 0-error

fun String.toCmdArray() = arrayOf("cmd", "/c") + this.split("""\s+""".toRegex())
fun error(text: String) = println("$YELLOW$text$CLEAR")
fun emphasis(text: String) = if (GLOBAL_LEVEL >= 1) println("$CYAN$text$CLEAR") else Unit
fun info(text: String) = if (GLOBAL_LEVEL >= 2) println("$GREEN$text$CLEAR") else Unit
fun normal(text: String) = if (GLOBAL_LEVEL >= 3) println(text) else Unit

fun showUsage(info: String? = null, status: Int = 0) {
    if (info != null) {
        error("Error: $info")
    }
    println(
        """
        Usage: kotlinc -script download.kts [file.m3u8] [options]
        Options:
            :folder | :f specify the folder name, default same as the file name
            :prefix | :p specify the prefix for download ts files, default is empty
            :rename | :n rename the m3u8 file and save to the specified folder, default is the same name
            :keyname| :k rename the key file name, default is key.key in the folder
            :cookie | :c specify the cookie for download key, default is nothing
            :output | :o the output file path, default to m3u8 file and the same folder with .mp4 extension
            :help   | :h show the manual information
            :verbose  | :v show the console output, level 0 is off and level 3 (default) for all
    """.trimIndent()
    )
    
    exitProcess(status)
}

fun initializeConfig(config: MutableMap<String, String>, m3u8: String) {
    val fileName = if (m3u8.endsWith(".m3u8")) m3u8.substringBeforeLast(".m3u8") else m3u8
    config.set("folder", fileName)
    config.set("prefix", "")
    config.set("rename", m3u8)
    config.set("keyname", "key.key")
    config.set("output", fileName + ".mp4")
    config.set("cookie", COOKIE)
    config.set("verbose", GLOBAL_LEVEL.toString())
}

fun resolveArgs(config: MutableMap<String, String>) {
    val stack = LinkedList<String>(args.toList())
    if (stack.size == 0) {
        showUsage("m3u8 file is mandatory")
    }
    
    val m3u8 = stack.pop()
    if (m3u8 == ":h" || m3u8 == ":help") {
        showUsage()
    }
    
    val file = File(m3u8)
    if (!file.exists() || !file.isFile) {
        showUsage("$m3u8 file is not existed, process is terminated", 1)
    }
    
    config.set("m3u8", m3u8)
    initializeConfig(config, m3u8)
    
    while (stack.isNotEmpty()) {
        val option = stack.pop()
        if (option == ":help" || option == ":h") {
            showUsage()
        }
        if (stack.isEmpty()) {
            showUsage("no value for option $option", 2)
        }
        val value = stack.pop()
        when (option) {
            ":folder", ":f" -> config.set("folder", value)
            ":prefix", ":p" -> config.set("prefix", value)
            ":rename", ":n" -> config.set("rename", if (value.endsWith(".m3u8")) value else "${value}.m3u8")
            ":keyname", ":k" -> config.set("keyname", value)
            ":output", ":o" -> config.set("output", if (value.contains(".")) value else "${value}.mp4")
            ":cookie", ":c" -> config.set("cookie", value)
            ":verbose", ":v" -> config.set("verbose", value)
            else -> showUsage("no such option: $option", 3)
        }
    }
}

suspend fun downloadFilesAsync(config: Map<String, String>, urlList: List<String>) {
    val jobs = mutableListOf<Job>()
    coroutineScope {
        urlList.forEach {
            info("[Coroutine] Ready for download url: ${config["prefix"]}$it")
            // TODO: the file name may contain un-allowed characters likes: / as url parts
            val fileName = it
            jobs += launch {
                downloadUrl("${config["prefix"]}$it", File(config["folder"], fileName))
                info("[Coroutine] Done with: $fileName, saved in: ${config["folder"]}/${fileName}")
            }
        }
    }
    jobs.forEach { it.join() }
    emphasis("[Coroutine] All ${urlList.size} ts files is downloaded in ${config["folder"]}")
}

fun downloadFiles(config: Map<String, String>, urlList: List<String>) {
    urlList.forEach {
        info("Ready for download url: ${config["prefix"]}$it")
        val connection = URI.create("${config["prefix"]}$it").toURL().openConnection()
        // TODO: the file name may contain un-allowed characters likes: / as url parts
        val fileName = it
        val file = File(config["folder"], fileName)
        File(config["folder"], fileName).outputStream().use { writer ->
            connection.getInputStream().buffered().use { reader ->
                val bytes = ByteArray(10240)
                while (true) {
                    val len = reader.read(bytes)
                    if (len == -1) {
                        break
                    }
                    writer.write(bytes, 0, len)
                }
            }
        }
        info("Done with: $fileName, saved in: ${config["folder"]}/${fileName}")
    }
    emphasis("All ${urlList.size} ts files is downloaded in ${config["folder"]}")
}

fun downloadKey(config: Map<String, String>, keyUrl: String) {
    val connection = URI.create(keyUrl).toURL().openConnection()
    connection.setRequestProperty("Cookie", config["cookie"])
    connection.connect()
    
    File(config["folder"], config["keyname"]!!).outputStream().use { writer ->
        connection.getInputStream().buffered().use { reader ->
            val bytes = ByteArray(10240)
            while (true) {
                val len = reader.read(bytes)
                if (len == -1) {
                    break
                }
                writer.write(bytes, 0, len)
            }
        }
    }
    
    emphasis("Done with key download, saved in: ${config["folder"]}/${config["keyname"]}")
}

fun rewriteFile(config: Map<String, String>): Pair<String?, List<String>> {
    val m3u8File = File(config["m3u8"]!!)
    val prefix = config["prefix"]!!
    val folderFile = File(config["folder"]!!)
    val destination = File(folderFile, config["rename"]!!)
    val keyFilePath = File(folderFile, config["keyname"]!!).absolutePath.replace("\\", "/")
    
    if (! folderFile.exists()) {
        folderFile.mkdirs()
    }
    destination.delete()
    destination.createNewFile()
    
    var keyUrl: String? = null
    val urlList = arrayListOf<String>()
    m3u8File.bufferedReader().lineSequence().forEach {
        val text = when {
            it.startsWith("#EXT-X-KEY") && it.contains("URI") -> {
                keyUrl = """URI="(.+)"""".toRegex().find(it)?.groupValues?.last()
                it.replace("""URI=".+"""".toRegex(), """URI="${keyFilePath}"""")
            }
            ! it.startsWith("#") && it.endsWith(".ts") -> it.substringAfter(prefix).also { urlList.add(it) }
            else -> it
        }
        destination.appendText("$text\n")
    }
    
    emphasis("Done with m3u8 file rewrote and saved in: ${config["folder"]}/${config["rename"]}")
    return Pair(keyUrl, urlList)
}

fun startFfmpegMerge(config: Map<String, String>): Int {
    emphasis("Start merge in ffmpeg in folder: ${config["folder"]} with output: ${config["output"]}")
    val ffmpegCmd = "ffmpeg -allowed_extensions ALL -i \"${config["folder"]}/${config["rename"]}\" -c copy \"${config["output"]}\""
    info("Run command in background: $ffmpegCmd")
    val process = Runtime.getRuntime().exec(ffmpegCmd.toCmdArray())
    // TODO: this should be error stream, and not terminated automatically!
    process.errorReader().lines().forEach {
        normal("[ffmpeg] $it")
    }
    return process.waitFor()
}

suspend fun downloadUrl(url: String, destination: File) {
    withContext(Dispatchers.IO) {
        val connection = URI.create(url).toURL().openConnection()
        destination.outputStream().use { writer ->
            connection.getInputStream().buffered().use { reader ->
                val bytes = ByteArray(10240)
                while (true) {
                    val len = reader.read(bytes)
                    if (len == -1) {
                        break
                    }
                    writer.write(bytes, 0, len)
                }
            }
        }
    }
}

fun start(): Nothing = runBlocking {
    resolveArgs(CONFIG)
    GLOBAL_LEVEL = CONFIG["verbose"]!!.toInt()
    
    val (keyUrl, urlList) = rewriteFile(CONFIG)
    if (keyUrl != null) {
        downloadKey(CONFIG, keyUrl)
    }
    // downloadFiles(CONFIG, urlList)
    downloadFilesAsync(CONFIG, urlList)
    
    val result = startFfmpegMerge(CONFIG)
    
    emphasis("Done with code $result [notice: the merge work in backgound may takes some time to be done]")
    exitProcess(result)
}

start()
// test()
# frozen_string_literal: true

##
# Jekyll 插件：生成搜索索引
# 功能：为本地搜索生成 JSON 格式的搜索索引文件
# 包含：标题、内容、标签、URL、日期等信息
#

module Jekyll
  module SearchIndex
    # 生成器类
    class SearchIndexGenerator < Generator
      priority :low

      def generate(site)
        # 创建索引数据
        index = build_index(site)

        # 写入 JSON 文件
        write_index(site, index)
      end

      private

      def build_index(site)
        posts = site.posts.docs.reject { |post| post['exclude_from_search'] }

        posts.map do |post|
          {
            'title' => post.data['title'] || '',
            'excerpt' => get_excerpt(post),
            'content' => get_content(post),
            'url' => post.url,
            'date' => post.data['date'].to_s,
            'tags' => post.data['tags'] || [],
            'categories' => post.data['categories'] || [],
            'author' => post.data['author'] || site.data['author'] || '',
            'description' => post.data['description'] || ''
          }
        end
      end

      # 获取文章摘要
      def get_excerpt(post)
        # Jekyll 会自动生成 excerpt，如果存在则使用
        if post.data['excerpt'].is_a?(String)
          strip_html(post.data['excerpt'])
        elsif post.data['excerpt']
          # 如果 excerpt 是对象，先转换为字符串
          strip_html(post.data['excerpt'].to_s)
        elsif post.content =~ /<!-- more -->/
          split_content = post.content.split('<!-- more -->')
          strip_html(split_content[0])
        else
          excerpt_from_content(post.content, 200)
        end
      end

      # 从内容开头提取摘要
      def excerpt_from_content(content, length)
        text = strip_html(content)
        text = text.gsub(/\s+/, ' ').strip
        if text.length > length
          text[0...length].strip + '...'
        else
          text
        end
      end

      # 获取文章内容（去除 HTML 标签）
      def get_content(post)
        content = post.content.dup

        # 移除代码块（可选）
        content.gsub!(/```[\s\S]*?```/, '')
        content.gsub!(/~~~[\s\S]*?~~~/, '')

        # 移除 HTML 标签
        strip_html(content)
      end

      # 移除 HTML 标签
      def strip_html(text)
        return '' if text.nil?

        # 移除 Markdown 代码块
        text = text.gsub(/```[\s\S]*?```/, '')
               .gsub(/~~~[\s\S]*?~~~/, '')
               .gsub(/`[^`]+`/, '')

        # 移除 HTML 标签
        text = text.gsub(/<[^>]+>/, '')

        # 移除多余的空白
        text = text.gsub(/\s+/, ' ').strip

        text
      end

      # 写入索引文件
      def write_index(site, index)
        # 写到源目录的 search 文件夹，而不是 _site 目录
        # 这样 Jekyll 会自动将它复制到构建输出中
        source_dir = site.source
        search_dir = File.join(source_dir, 'search')
        FileUtils.mkdir_p(search_dir)

        path = File.join(search_dir, 'index.json')

        File.open(path, 'w') do |f|
          f.write(JSON.pretty_generate(index))
        end

        puts "Search index created: #{path} (#{index.length} posts)"
      rescue => e
        puts "Error writing search index: #{e.message}"
        puts e.backtrace.join("\n")
      end
    end
  end
end

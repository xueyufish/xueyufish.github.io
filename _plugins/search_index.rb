# frozen_string_literal: true

##
# Jekyll 插件：生成搜索索引
# 通过 :post_write hook 在 _site/ 写完后生成，避免触发 watch 循环
#

module Jekyll
  module SearchIndex
    Jekyll::Hooks.register :site, :post_write do |site|
      index = build_index(site)
      write_index(site, index)
    end

    module_function

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

    def get_excerpt(post)
      if post.data['excerpt'].is_a?(String)
        strip_html(post.data['excerpt'])
      elsif post.data['excerpt']
        strip_html(post.data['excerpt'].to_s)
      elsif post.content =~ /<!-- more -->/
        split_content = post.content.split('<!-- more -->')
        strip_html(split_content[0])
      else
        excerpt_from_content(post.content, 200)
      end
    end

    def excerpt_from_content(content, length)
      text = strip_html(content)
      text = text.gsub(/\s+/, ' ').strip
      if text.length > length
        text[0...length].strip + '...'
      else
        text
      end
    end

    def get_content(post)
      content = post.content.dup
      content.gsub!(/```[\s\S]*?```/, '')
      content.gsub!(/~~~[\s\S]*?~~~/, '')
      strip_html(content)
    end

    def strip_html(text)
      return '' if text.nil?

      text = text.gsub(/```[\s\S]*?```/, '')
             .gsub(/~~~[\s\S]*?~~~/, '')
             .gsub(/`[^`]+`/, '')
             .gsub(/<[^>]+>/, '')
             .gsub(/\s+/, ' ').strip

      text
    end

    def write_index(site, index)
      dest_dir = site.dest
      search_dir = File.join(dest_dir, 'search')
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

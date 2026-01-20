# frozen_string_literal: true

##
# Jekyll 插件：字数统计和阅读时间计算
# 功能：
# 1. 统计文章字数（兼容中英文）
# 2. 计算阅读时间（每分钟 300 字）
# 3. 添加到文章的元数据中
#

module Jekyll
  module ReadingTime
    # 中文字符（包括中文标点）
    CHINESE_CHAR_REGEX = /[\u4e00-\u9fa5\u3000-\u303f\uff00-\uffef]/
    # 英文单词
    ENGLISH_WORD_REGEX = /[a-zA-Z0-9]+/

    class ReadingTimeGenerator < Generator
      def generate(site)
        site.posts.docs.each do |post|
          calculate_reading_time(post)
        end
      end

      private

      def calculate_reading_time(post)
        content = post.content

        # 移除代码块（可选）
        content_without_code = remove_code_blocks(content)

        # 统计中文字符
        chinese_chars = content_without_code.scan(CHINESE_CHAR_REGEX).length

        # 统计英文单词数
        english_words = content_without_code.scan(ENGLISH_WORD_REGEX).length

        # 计算总字数
        total_words = chinese_chars + english_words

        # 计算阅读时间（每分钟 300 字）
        words_per_minute = 300
        reading_minutes = (total_words.to_f / words_per_minute).ceil
        reading_minutes = 1 if reading_minutes < 1

        # 添加到文章数据中
        post.data['word_count'] = total_words
        post.data['reading_time'] = reading_minutes
      end

      def remove_code_blocks(content)
        # 移除 Markdown 代码块
        content.gsub(/```[\s\S]*?```/, '')
               .gsub(/~~~[\s\S]*?~~~/, '')
               .gsub(/`[^`]+`/, '')
      end
    end
  end
end

# 注册生成器
Jekyll::ReadingTime::ReadingTimeGenerator

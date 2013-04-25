module Jekyll
  class AgeTag < Liquid::Tag
    
    def render(context)
      dob = Date.parse('1989-02-13')
      now = Time.new
      now.year - dob.year - ((now.month > dob.month || (now.month == dob.month && now.day >= dob.day)) ? 0 : 1)
    end
  end
end

Liquid::Template.register_tag('age', Jekyll::AgeTag)